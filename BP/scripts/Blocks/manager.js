export class BlockManager {
    static getBlock(dimension, location) {
        try {
            return dimension.getBlock(location);
        }
        catch {
            return undefined;
        }
    }
    static destroyBlock(dimension, location) {
        const { x, y, z } = location;
        dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
    }
}
