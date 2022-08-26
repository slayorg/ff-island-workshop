export interface Item{
    id: number;
    name: string;
    icon: string;
};

export interface PouchItem extends Item{
    pouchId: number;
};

export interface WorkshopItem extends Item{
    categories: string[];
    materials: {
        item: PouchItem;
        quantity: number;
    }[];
    tier: number;
    hours: number;
    value: number;
};

export interface AgendaItem{
    item: WorkshopItem;
    bonus: number;
}

export interface SummaryData{
    hours: number;
    money: number;
    values: {
        value: number;
        bonus: boolean;
    }[];
}