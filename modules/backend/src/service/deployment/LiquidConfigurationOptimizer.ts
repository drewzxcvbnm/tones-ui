import { provide } from "inversify-binding-decorators";
import { getComparator } from "sharedlib/collection.util";
import { DeploymentLiquidConfiguration } from "sharedlib/dto/liquidconfiguration.dto";
import { TubeConfigState } from "./TubeConfigState";
import config from "sharedlib/tones-config.json";
import { add } from "lodash";
import { LiquidApplicationCommand } from "@service/commands/Commands";
import { LiquidDeploymentInfo } from "./LiquidDeploymentInfo";

@provide(LiquidConfigurationOptimizer)
export class LiquidConfigurationOptimizer {

    readonly sizes = config["liquids-tube-holders"].filter(t => !t["for-washing"]).map(t => t.size);
    readonly limits = config["liquids-tube-holders"].filter(t => !t["for-washing"]).map(t => t.count);

    public optimizeLiquidConfig(liquidConfig: DeploymentLiquidConfiguration[], state: TubeConfigState): DeploymentLiquidConfiguration[] {
        return liquidConfig
            .sort(getComparator(this.configWaste))
            .flatMap(c => this.optimizeConfig(c, state))
    }

    private optimizeConfig(config: DeploymentLiquidConfiguration, state: TubeConfigState): DeploymentLiquidConfiguration[] {
        const ways = this.getWays(config.usedAmount)
        console.log(`Ways: ${ways}`)
        const bestNewWay = ways.sort(getComparator(way => way.reduce(add, 0) - config.usedAmount))
            .find(way => this.isApplicable(way, state, (config as LiquidDeploymentInfo).hydratedCommands));
        if (bestNewWay == undefined) {
            return [config]
        }
        return this.applyNewConfig(config, bestNewWay, state);
    }

    private applyNewConfig(config: DeploymentLiquidConfiguration, bestNewWay: number[], state: TubeConfigState): DeploymentLiquidConfiguration[] {
        const configs: DeploymentLiquidConfiguration[] = []
        for (const s of bestNewWay) {
            configs.push({
                liquid: undefined,
                liquidId: config.liquidId,
                liquidAmount: s,
                usedAmount: s,
                liquidSlotNumber: state.allocateLiquidSlotOfSize(s),
            })
        }
        for (const com of (config as LiquidDeploymentInfo).hydratedCommands) {
            const i = configs.findIndex((v, i) => v.usedAmount >= com.volume);
            configs[i].usedAmount -= com.volume
            com.from = configs[i].liquidSlotNumber
        }
        return configs
    }

    private isApplicable(liquidConfigWay: number[], state: TubeConfigState, commands: LiquidApplicationCommand[]): boolean {
        const applications = commands.map(c => c.volume)
        return state.canAllocateSlots(liquidConfigWay) && this.isApplicableWithCommands([...liquidConfigWay], applications);
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


    private configWaste(d: DeploymentLiquidConfiguration): number {
        return d.liquidAmount - d.usedAmount;
    }

}

