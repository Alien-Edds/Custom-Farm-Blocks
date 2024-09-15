import { ItemStack } from "@minecraft/server";

export class ItemManager{
    static decreaseStack(item: ItemStack): ItemStack | undefined {
        if (item.amount > 1) {
            item.amount = item.amount - 1
            return item
        } else return undefined
    }
}