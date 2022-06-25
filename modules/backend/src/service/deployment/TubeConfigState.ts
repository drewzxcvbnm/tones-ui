import { countMap } from "sharedlib/collection.util";
import config from "sharedlib/tones-config.json";

export class TubeConfigState {
    tubeSizeCountMap: Map<number, number> = new Map(
        config["liquids-tube-holders"]
            .filter(th => !th["for-washing"])
            .map(th => [th["size"], th["count"]])
    );

    getAvailableSizes() {
        return Array.from(this.tubeSizeCountMap.entries()).filter(kv => kv[1] > 0).map(kv => kv[0]);
    }

    allocateLiquidSlotOfSize(size: number) {
        const sizeCount = config["liquids-tube-holders"]
            .filter(th => th["size"] === size)
            .map(th => th["count"])[0];
        const previousLiquidSlots = config["liquids-tube-holders"]
            .filter(th => th["size"] < size)
            .map(th => th["count"])
            .reduce((a, b) => a + b, 0);
        this.tubeSizeCountMap.set(size, this.tubeSizeCountMap.get(size)! - 1);
        return previousLiquidSlots + sizeCount - this.tubeSizeCountMap.get(size)!;
    }

    canAllocateSlots(liquidConfigWay: number[]): boolean {
        const m = countMap(liquidConfigWay);
        for (const [k, v] of m.entries()) {
            if (this.tubeSizeCountMap.get(k)! < v) {
                return false;
            }
        }
        return true;
    }
}
