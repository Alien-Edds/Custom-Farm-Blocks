import { ContainerSlot, EntityEquippableComponent, EquipmentSlot, Player } from "@minecraft/server";

export class PlayerManager{
    static getEquipmentSlot(player: Player, EquipmentSlot: EquipmentSlot): ContainerSlot {
        return (player.getComponent(EntityEquippableComponent.componentId) as EntityEquippableComponent).getEquipmentSlot(EquipmentSlot)
    }
}