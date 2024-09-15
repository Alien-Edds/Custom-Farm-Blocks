import { ItemEnchantableComponent, system, world } from "@minecraft/server";
import { CropWheatBlock } from "./Custom Farm Blocks/Custom Wheat Block/constructor";
import { BlockManager } from "./Blocks/manager";
import { CropMelonBlock } from "./Custom Farm Blocks/Custom Melon Block/constructor";
world.sendMessage("§eCustom Farm Blocks §aloaded");
world.beforeEvents.worldInitialize.subscribe((data) => {
    data.blockComponentRegistry.registerCustomComponent("example:my_custom_wheat_block_component", new CropWheatBlock("example:growth", 7, { numerator: 1, denominator: 3 }, true));
    data.blockComponentRegistry.registerCustomComponent("example:my_custom_melon_crop_component", new CropMelonBlock("example:growth", "example:connected", "example:connected_side", 7, { numerator: 1, denominator: 4 }, "minecraft:melon_block", true));
});
world.beforeEvents.playerBreakBlock.subscribe((data) => {
    const { block, itemStack, dimension } = data;
    if (!block.hasTag("example:disable_silk_touch"))
        return;
    if (!itemStack)
        return;
    const comp = itemStack.getComponent(ItemEnchantableComponent.componentId);
    if (!comp)
        return;
    if (!comp.hasEnchantment("silk_touch"))
        return;
    data.cancel = true;
    system.runTimeout(() => {
        BlockManager.destroyBlock(dimension, block.location);
    });
});
