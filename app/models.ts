export interface FFData{
    workshopItems: WorkshopItem[];
    pouchItems: PouchItem[];
    categories: Map<number, string>;
    workshopRanks: {rank: number, bonus: number}[];
    supplyValues: {value: number, name: string, bonus: number}[];
    popularityValues: {value: number, name: string, bonus: number}[];
    popularitySchedule: number[][];
    landmarkValues: number[];
};

export interface Item{
    id: number;
    name: string;
    icon: string;
};

export interface PouchItem extends Item{
    pouchId: number;
};

export interface WorkshopItem extends Item{
    craftId: number;
    categories: string[];
    materials: {
        item: PouchItem;
        quantity: number;
    }[];
    tier: number;
    hours: number;
    value: number;

    supply: FFData["supplyValues"][0];
};

export interface CraftingDay{

    totalAmount: number;
    endOfDayGroove: number;

    workshops: {
        totalAmount: number;
        totalHours: number;
        crafts: {
            item: WorkshopItem;
            value: number;
            bonus: boolean;
        }[];
    }[];

}

export interface CraftResults{
    money: number;
    hours: number;
    items: {
        item: WorkshopItem;
        value: number;
        efficiencyBonus: boolean;
    }[];
}