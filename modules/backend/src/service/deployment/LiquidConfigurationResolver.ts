import { provide } from "inversify-binding-decorators";
import * as lodash from "lodash";
import { add } from "lodash";
import { cartesianProduct, getComparator, groupBy } from "sharedlib/collection.util";
import { DeploymentLiquidConfiguration } from "sharedlib/dto/liquidconfiguration.dto";
import config from "sharedlib/tones-config.json";
import { LiquidApplicationCommand } from "../../service/commands/Commands";
import { TubeConfigState } from "./TubeConfigState";

@provide(LiquidConfigurationResolver)
export class LiquidConfigurationResolver {


    readonly sizes = config["liquids-tube-holders"].filter(t => !t["for-washing"]).map(t => t.size);
    readonly limits = config["liquids-tube-holders"].filter(t => !t["for-washing"]).map(t => t.count);

    public resolveLiquidConfiguration(commands: LiquidApplicationCommand[]): DeploymentLiquidConfiguration[] {
        const state = new TubeConfigState();
        const nonWashingCommands = commands.filter(la => !la.liquidInfo.isWashing);
        const nonWashingDeploymentConfig = this.getLiquidsConfiguration(nonWashingCommands, state)
        const washingTubeConfig = config["liquids-tube-holders"].filter(t => t["for-washing"])[0]
        state.tubeSizeCountMap.set(washingTubeConfig.size, washingTubeConfig.count);
        const washingDeploymentConfig = this.getLiquidsConfiguration(commands.filter(la => la.liquidInfo.isWashing), state)
        return lodash.concat(nonWashingDeploymentConfig, washingDeploymentConfig)
    }

    private getLiquidsConfiguration(commands: LiquidApplicationCommand[], state: TubeConfigState): DeploymentLiquidConfiguration[] {
        const liquidCommands = Array.from(groupBy(commands, c => c.liquidInfo.id).values())
            .sort(getComparator(cms => lodash.sum(cms.map(c => c.volume))));
        const liquidsConfigs = liquidCommands
            .map(cms => this.getConfigurationsForLiquid(cms, state));
        const bestConfigs = cartesianProduct(...liquidsConfigs)
            .filter(conf => state.canAllocateSlots(conf.flat()))
            .sort(getComparator(conf => {
                let wasteSum = 0
                for (let i = 0; i < conf.length; i++) {
                    wasteSum += this.wastefullness([...conf[i]], [...liquidCommands[i].map(lc => lc.volume)])
                }
                return wasteSum;
            }));
        if (bestConfigs.length == 0) {
            throw new Error("Impossible to resolve config");
        }
        const deploymentConfig: DeploymentLiquidConfiguration[] = []
        const bestConfig = bestConfigs.at(0)!;
        for (let i = 0; i < bestConfig.length; i++) {
            const liquidConfig = bestConfig[i];
            for (let j = 0; j < liquidConfig.length; j++) {
                deploymentConfig.push({
                    liquidId: liquidCommands[i].at(0)!.liquidInfo.id,
                    liquidAmount: liquidConfig.at(j)!,
                    liquidSlotNumber: state.allocateLiquidSlotOfSize(liquidConfig.at(j)!),
                    liquid: undefined
                })
            }
        }
        return deploymentConfig;
    }

    private getConfigurationsForLiquid(commands: LiquidApplicationCommand[], state: TubeConfigState): number[][] {
        const applicationVolumes = commands.map(c => c.volume);
        const targetSum = applicationVolumes.reduce(add);
        const validWays = this.getWays(targetSum)
            .filter(w => this.isApplicableWithCommands([...w], [...applicationVolumes]));
        const waysMap = groupBy(validWays, w => w.length);
        return Array.from(waysMap.keys())
            .map(k => waysMap.get(k)!.sort(getComparator(w => this.wastefullness([...w], [...applicationVolumes]))).at(0)!);
    }

    private wastefullness(liquidConfigWay: number[], applications: number[]): number {
        if (applications.length == 0) {
            return liquidConfigWay.reduce(add);
        }
        const ap = applications.pop()!
        const i = liquidConfigWay.findIndex((v, i) => v >= ap)
        liquidConfigWay[i] -= ap
        return this.wastefullness(liquidConfigWay, applications);
    }

    private isApplicableWithCommands(liquidConfigWay: number[], applications: number[]): boolean {
        if (applications.length == 0) {
            return true;
        }
        const ap = applications.pop()!
        const i = liquidConfigWay.findIndex((v, i) => v >= ap)
        if (i == -1) {
            return false;
        }
        liquidConfigWay[i] -= ap
        return this.isApplicableWithCommands(liquidConfigWay, applications);
    }

    private getWays(targetSum: number): number[][] {
        const cache: Set<string> = new Set();
        const limits = this.limits;
        const sizes = this.sizes;
        function _getWays(targetSum: number, currentSum: number, currentSet: number[], occurrence: number[]): number[][] {
            if (cache.has(Array.from(occurrence.values()).toString())) {
                return [];
            }
            for (let i = 0; i < limits.length; i++) {
                if (occurrence[i] > limits[i]) {
                    return []
                }
            }
            if (currentSum >= targetSum) {
                return [currentSet]
            }
            let i = 0;
            return sizes.flatMap(s => {
                let o = [...occurrence]
                cache.add(o.toString())
                o[i]++; i++;
                return _getWays(targetSum, currentSum + s, [...currentSet, s], o)
            })
        }
        return _getWays(targetSum, 0, [], [0, 0, 0]);
    }

}