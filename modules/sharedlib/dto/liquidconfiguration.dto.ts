import { LiquidDto } from "./liquid.dto";
import {} from "../"

export interface DeploymentLiquidConfiguration {
    liquidSlotNumber: number;
    liquidId: number;
    liquid: LiquidDto | undefined;
    liquidAmount: number;
    usedAmount: number;
}