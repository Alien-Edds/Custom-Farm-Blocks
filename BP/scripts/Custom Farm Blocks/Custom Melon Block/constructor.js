import { BlockPermutation, EquipmentSlot, GameMode } from "@minecraft/server";
import { ConnectedSide } from "../interfaces";
import { PlayerManager } from "../../Player/manager";
import { ItemManager } from "../../Items/manager";
import { randomNum, randomWholeNum } from "../../Math/randomNumbers";
import { BlockManager } from "../../Blocks/manager";
export class CropMelonBlock {
    update(block, dimension) {
        if (block.permutation.getState(this.growthStateId) != this.maxGrowthStage)
            return;
        if (!block.permutation.getState(this.connectedStateId))
            return;
        const connectedSide = block.permutation.getState(this.connectedSideStateId);
        const location = block.location;
        const locations = [
            { location: { x: location.x, y: location.y, z: location.z - 1 }, side: ConnectedSide.North },
            { location: { x: location.x, y: location.y, z: location.z + 1 }, side: ConnectedSide.South },
            { location: { x: location.x + 1, y: location.y, z: location.z }, side: ConnectedSide.East },
            { location: { x: location.x - 1, y: location.y, z: location.z }, side: ConnectedSide.West },
        ];
        const checkLocation = locations.find((f) => f.side == connectedSide);
        if (!checkLocation)
            return;
        const checkBlock = BlockManager.getBlock(dimension, checkLocation.location);
        if (!checkBlock || checkBlock.typeId != this.placesBlockId)
            block.setPermutation(block.permutation.withState(this.connectedStateId, false));
    }
    onTick = (data) => {
        this.update(data.block, data.dimension);
    };
    onRandomTick = (data) => {
        const { block, dimension } = data;
        const random = randomNum(0, this.growthChance.denominator);
        if (random > this.growthChance.numerator)
            return;
        const state = block.permutation.getState(this.growthStateId);
        if (state >= this.maxGrowthStage) {
            const connected = block.permutation.getState(this.connectedStateId);
            if (connected)
                return;
            const placeableBlock = this.getPlaceableBlock(dimension, block.location);
            if (!placeableBlock)
                return;
            placeableBlock.block.setPermutation(BlockPermutation.resolve(this.placesBlockId));
            block.setPermutation(block.permutation.withState(this.connectedStateId, true).withState(this.connectedSideStateId, placeableBlock.side));
        }
        else
            block.setPermutation(block.permutation.withState(this.growthStateId, state + 1));
    };
    onPlayerInteract = (data) => {
        if (!this.bonemealable)
            return;
        const { player, block } = data;
        if (!player)
            return;
        const mainhand = PlayerManager.getEquipmentSlot(player, EquipmentSlot.Mainhand);
        const item = mainhand.getItem();
        if (item?.typeId != "minecraft:bone_meal")
            return;
        const state = block.permutation.getState(this.growthStateId);
        if (state >= this.maxGrowthStage)
            return;
        if (player.getGameMode() != GameMode.creative)
            mainhand.setItem(ItemManager.decreaseStack(item));
        let setStage = state + randomWholeNum(2, 4);
        if (setStage > this.maxGrowthStage)
            setStage = this.maxGrowthStage;
        block.setPermutation(block.permutation.withState(this.growthStateId, setStage));
        const center = block.center();
        block.dimension.playSound("item.bone_meal.use", center);
        block.dimension.spawnParticle("minecraft:crop_growth_emitter", center);
    };
    getPlaceableBlock(dimension, location) {
        const blocks = [];
        const locations = [
            { location: { x: location.x, y: location.y, z: location.z - 1 }, side: ConnectedSide.North },
            { location: { x: location.x, y: location.y, z: location.z + 1 }, side: ConnectedSide.South },
            { location: { x: location.x + 1, y: location.y, z: location.z }, side: ConnectedSide.East },
            { location: { x: location.x - 1, y: location.y, z: location.z }, side: ConnectedSide.West },
        ];
        for (let i = 0; i < locations.length; i++) {
            const loc = locations[i].location;
            const block = BlockManager.getBlock(dimension, loc);
            if (!block || !block.isAir)
                continue;
            const bottomBlock = BlockManager.getBlock(dimension, { x: loc.x, y: loc.y - 1, z: loc.z });
            if (!bottomBlock)
                continue;
            if (bottomBlock.isAir || bottomBlock.isLiquid)
                continue;
            blocks.push({ block: block, side: locations[i].side });
        }
        if (blocks[0]) {
            return blocks[randomWholeNum(0, blocks.length - 1)];
        }
        else
            return undefined;
    }
    maxGrowthStage;
    growthStateId;
    growthChance;
    bonemealable;
    connectedStateId;
    connectedSideStateId;
    placesBlockId;
    /**
     *
     * @param growthStateId The block's growth state identifier.
     * @param connectedStateId The block's connected state identifier.
     * @param connectedSideStateId The block's connected direction state identifier.
     * @param maxGrowthStage The max growth stage for the growth state.
     * @param growthChance The growth chance. (numerator MUST be lower than the denominator)
     * @param placesBlockId The identifier for the block that this places. (eg: "minecraft:melon_block")
     * @param bonemealable Sets if this crop can be bonemealed.
     * @example ```ts
     * world.beforeEvents.worldInitialize.subscribe((data) => {
     *       data.blockComponentRegistry.registerCustomComponent("example:my_custom_melon_crop_component", new CropMelonBlock("example:growth", "example:connected", "example:connected_side", 7, {numerator: 1, denominator: 4}, "minecraft:melon_block", true))
     *   })
     * ```
     */
    constructor(growthStateId, connectedStateId, connectedSideStateId, maxGrowthStage, growthChance, placesBlockId, bonemealable) {
        this.growthStateId = growthStateId;
        this.maxGrowthStage = maxGrowthStage;
        this.growthChance = growthChance;
        this.bonemealable = bonemealable;
        this.connectedStateId = connectedStateId;
        this.connectedSideStateId = connectedSideStateId;
        this.placesBlockId = placesBlockId;
    }
}
