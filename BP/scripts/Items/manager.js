export class ItemManager {
    static decreaseStack(item) {
        if (item.amount > 1) {
            item.amount = item.amount - 1;
            return item;
        }
        else
            return undefined;
    }
}
