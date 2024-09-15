import { EntityEquippableComponent } from "@minecraft/server";
export class PlayerManager {
    static getEquipmentSlot(player, EquipmentSlot) {
        return player.getComponent(EntityEquippableComponent.componentId).getEquipmentSlot(EquipmentSlot);
    }
}
