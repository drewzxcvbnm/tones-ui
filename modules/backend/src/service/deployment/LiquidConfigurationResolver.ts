import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import * as lodash from "lodash";
import { getComparator, groupBy } from "sharedlib/collection.util";
import { DeploymentLiquidConfiguration } from "sharedlib/dto/liquidconfiguration.dto";
import config from "sharedlib/tones-config.json";
import { LiquidApplicationCommand } from "../../service/commands/Commands";
import { LiquidConfigurationOptimizer } from "./LiquidConfigurationOptimizer";
import { LiquidDeploymentInfo } from "./LiquidDeploymentInfo";
import { TubeConfigState } from "./TubeConfigState";

@provide(LiquidConfigurationResolver)
export class LiquidConfigurationResolver {

    @inject(LiquidConfigurationOptimizer)
    private optimizer: LiquidConfigurationOptimizer;

    public resolveLiquidConfiguration(commands: LiquidApplicationCommand[]): DeploymentLiquidConfiguration[] {
        const state = new TubeConfigState();
        const nonWashingCommands = commands.filter(la => !la.liquidInfo.isWashing);
        const nonWashingDeploymentConfig = this.getLiquidsConfiguration(nonWashingCommands, state)
        const washingTubeConfig = config["liquids-tube-holders"].filter(t => t["for-washing"])[0]
        state.tubeSizeCountMap.set(washingTubeConfig.size, washingTubeConfig.count);
        const washingDeploymentConfig = this.getLiquidsConfiguration(commands.filter(la => la.liquidInfo.isWashing), state)
        return lodash.concat(this.optimizer.optimizeLiquidConfig(nonWashingDeploymentConfig, state), washingDeploymentConfig)
    }

    private getLiquidsConfiguration(commands: LiquidApplicationCommand[], state: TubeConfigState): DeploymentLiquidConfiguration[] {
        return Array.from(groupBy(commands, c => c.liquidInfo.id).values())
            .sort(getComparator(cms => lodash.sum(cms.map(c => c.volume))))
            .flatMap(cms => this.getLiquidConfiguration(cms, state))
    }

    private getLiquidConfiguration(commands: LiquidApplicationCommand[], state: TubeConfigState): DeploymentLiquidConfiguration[] {
        let acc = 0;
        let hydratedCommands: LiquidApplicationCommand[] = [];
        const liquidConfig: LiquidDeploymentInfo[] = []
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.volume > Math.max(...state.getAvailableSizes())) {
                throw new Error("Impossible to configure liquids for protocol deployment");
            }
            acc += command.volume;
            if (state.getAvailableSizes().every(s => acc > s)) {
                const maxAvailableSize = Math.max(...state.getAvailableSizes())
                const dlc: LiquidDeploymentInfo = {
                    liquidAmount: maxAvailableSize,
                    liquidId: commands[0].liquidInfo.id!,
                    liquidSlotNumber: state.allocateLiquidSlotOfSize(maxAvailableSize),
                    liquid: undefined,
                    usedAmount: acc - command.volume,
                    hydratedCommands,
                }
                liquidConfig.push(dlc);
                hydratedCommands.forEach(c => c.from = dlc.liquidSlotNumber);
                hydratedCommands = [];
                acc = 0;
                i--;
                continue;
            }
            hydratedCommands.push(command);
        }
        const sizeIndex = state.getAvailableSizes().findIndex(s => s >= acc)
        if (sizeIndex === -1) {
            throw new Error("Impossible to configure liquids for protocol deployment");
        }
        const maxRequiredSize = state.getAvailableSizes()[sizeIndex]
        const dlc: LiquidDeploymentInfo = {
            liquidAmount: maxRequiredSize,
            liquidId: commands[0].liquidInfo.id!,
            liquidSlotNumber: state.allocateLiquidSlotOfSize(maxRequiredSize),
            liquid: undefined,
            usedAmount: acc,
            hydratedCommands,
        }
        hydratedCommands.forEach(c => c.from = dlc.liquidSlotNumber);
        liquidConfig.push(dlc);
        return liquidConfig;
    }

}