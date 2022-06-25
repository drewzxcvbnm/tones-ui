import { LiquidApplicationCommand } from "@service/commands/Commands";
import { expect } from 'chai';
import { groupByMapped } from "sharedlib/collection.util";
import { LiquidConfigurationResolver } from "./LiquidConfigurationResolver";
import { container } from "index"

describe('Resolve liquid configuration', () => {
    const r = container.get(LiquidConfigurationResolver)
    it('Single liquid: [50 10]', () => {
        const conf = r.resolveLiquidConfiguration([
            new LiquidApplicationCommand(undefined, 1, 50, { id: 1, isWashing: false }),
            new LiquidApplicationCommand(undefined, 1, 10, { id: 1, isWashing: false }),
        ])
        const res = conf.map(d => d.liquidAmount)
        expect(res).to.deep.ordered.members([15, 50])
    })

    it('2 liquids: [1 2 2], [14 2]', () => {
        const conf = r.resolveLiquidConfiguration([
            new LiquidApplicationCommand(undefined, 1, 1, { id: 1, isWashing: false }),
            new LiquidApplicationCommand(undefined, 1, 2, { id: 1, isWashing: false }),
            new LiquidApplicationCommand(undefined, 1, 2, { id: 1, isWashing: false }),
            new LiquidApplicationCommand(undefined, 1, 14, { id: 2, isWashing: false }),
            new LiquidApplicationCommand(undefined, 1, 2, { id: 2, isWashing: false }),
        ])
        const liquidsConf = groupByMapped(conf, d => d.liquidId, d => d.liquidAmount)
        expect(liquidsConf.get(1)).to.deep.ordered.members([5])
        expect(liquidsConf.get(2)).to.deep.ordered.members([5, 15])
    })
})