import { DeploymentLiquidConfiguration } from "sharedlib/dto/liquidconfiguration.dto";
import { LiquidApplicationCommand } from "../../service/commands/Commands";

export interface LiquidDeploymentInfo extends DeploymentLiquidConfiguration {
    hydratedCommands: LiquidApplicationCommand[];
}
