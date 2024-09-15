import { BlockComponentPlayerDestroyEvent, BlockComponentPlayerInteractEvent, BlockComponentPlayerPlaceBeforeEvent, BlockComponentRandomTickEvent, BlockCustomComponent, EquipmentSlot, GameMode, world } from "@minecraft/server";
import { CropGrowthChance } from "../interfaces";
import { PlayerManager } from "../../Player/manager";
import { ItemManager } from "../../Items/manager";
import { randomNum, randomWholeNum } from "../../Math/randomNumbers";

export class CropWheatBlock implements BlockCustomComponent{
    onRandomTick?: ((arg: BlockComponentRandomTickEvent) => void) | undefined = (data) => {
        const {block} = data
        const random = randomNum(0, this.growthChance.denominator)
        if (random > this.growthChance.numerator) return
        const state = block.permutation.getState(this.stateId) as number
        if (state >= this.maxStage) return
        block.setPermutation(block.permutation.withState(this.stateId, state + 1))
    }
    onPlayerInteract?: ((arg: BlockComponentPlayerInteractEvent) => void) | undefined = (data) => {
        if (!this.bonemealable) return
        const {player, block} = data
        if (!player) return
        const mainhand = PlayerManager.getEquipmentSlot(player, EquipmentSlot.Mainhand)
        const item = mainhand.getItem()
        if (item?.typeId != "minecraft:bone_meal") return
        const state = block.permutation.getState(this.stateId) as number
        if (state >= this.maxStage) return
        if (player.getGameMode() != GameMode.creative) mainhand.setItem(ItemManager.decreaseStack(item))
        let setStage = state + randomWholeNum(2, 4)
        if (setStage > this.maxStage) setStage = this.maxStage
        block.setPermutation(block.permutation.withState(this.stateId, setStage))
        const center = block.center()
        block.dimension.playSound("item.bone_meal.use", center)
        block.dimension.spawnParticle("minecraft:crop_growth_emitter", center)
    }
    maxStage: number = 0
    stateId: string = ""
    growthChance: CropGrowthChance = {numerator: 0, denominator: 0}
    bonemealable: boolean;
    /**
     * 
     * @param stateId The identifier for the growth state.
     * @param maxStage The max stage for the growth state.
     * @param growthChance The growth chance. (numerator MUST be lower than the denominator)
     * @param bonemealable Sets if this crop can be bonemealed.
     * 
     * @example ```ts
     * world.beforeEvents.worldInitialize.subscribe((data) => {
     *       data.blockComponentRegistry.registerCustomComponent("example:my_custom_wheat_block_component", new CropWheatBlock("example:growth", 7, {numerator: 1, denominator: 3}, true))
     *   })
     * ```
     */
    constructor(stateId: string, maxStage: number, growthChance: CropGrowthChance, bonemealable: boolean) {
        this.stateId = stateId
        this.maxStage = maxStage
        this.growthChance = growthChance
        this.bonemealable = bonemealable
    }
}