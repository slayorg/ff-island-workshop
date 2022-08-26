import { WorkshopItem } from "../models";

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