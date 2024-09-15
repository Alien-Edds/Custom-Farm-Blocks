import { Block, Dimension, Vector3 } from "@minecraft/server";

export class BlockManager{
    static getBlock(dimension: Dimension, location: Vector3): Block | undefined {
        try {
            return dimension.getBlock(location)
        } catch {
            return undefined
        }
    }
    static destroyBlock(dimension: Dimension, location: Vector3) {
        const {x, y, z} = location
        dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`)
    }
}