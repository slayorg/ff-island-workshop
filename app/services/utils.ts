import { PopularitySchedule, WorkshopItem } from "../models";
import { ffData } from "./ffDataLoader";

export function hasEfficiencyBonus(a: WorkshopItem|null|undefined, b: WorkshopItem|null|undefined){
    if(a == null || b == null){
        return false;
    }
    if(a === b){
        return false;
    }
    for(let i=0; i<a.categories.length; i++){
        for(let n=0; n<b.categories.length; n++){
            if(a.categories[i] === b.categories[n]){
                return true;
            }
        }
    }
    return false;
}

export function calculateCraftValue(item: WorkshopItem, workshopBonus: number, groove: number, efficiencyBonus: boolean, popularityBonus: number){
    return (efficiencyBonus?2:1) * Math.floor((popularityBonus/100) * (item.supply.bonus/100) * Math.floor(item.value * (workshopBonus/100) * (1+groove/100)));
    //return Math.floor(Math.floor(item.value * (workshopBonus/100) * (1 + (groove/100)) * (popularityBonus/100)) * (item.supply.bonus/100) * (efficiencyBonus?2:1));
}

export function getPopularity(craftId: number, week: PopularitySchedule|null){
    if(!week){
        return ffData.popularityValues[2];
    }
    return ffData.popularityValues[week.data[craftId]-1];
}