import { CraftingDay, PopularitySchedule, PouchItem, WorkshopItem } from "../models";
import { ffData } from "./ffDataLoader";
import { calculateCraftValue, getPopularity, hasEfficiencyBonus } from "./utils";

export default class CraftingWeek{
    demandWeek: PopularitySchedule|null = null;
    totalAmount: number = 0;
    days: CraftingDay[];
    workshopRanks: number[];
    startingGroove: number = 0;
    watchValue = {};

    onUpdate: () => void = () => {};

    constructor(){
        this.days = [];
        this.workshopRanks = [1, 1, 1];

        for(let i=0; i<5; i++){
            this.days.push({
                endOfDayGroove: 0,
                totalAmount: 0,
                
                workshops: new Array(3).fill(0).map(w => {
                    return {
                        totalAmount: 0,
                        totalHours: 0,
                        rankBonus: 1,
                        crafts: []
                    }
                })
            });
        }
    }

    setDemandWeek(week: PopularitySchedule|null){
        this.demandWeek = week;
        this.update();
    }

    setStartingGroove(value: number){
        this.startingGroove = value;
        this.update();
    }

    addCraft(craft: WorkshopItem, dayIndex: number, workshopIndex: number){
        const day = this.days[dayIndex];
        const workshop = day.workshops[workshopIndex];

        workshop.crafts.push({
            bonus: false,
            item: craft,
            value: craft.value
        });
        this.update(dayIndex);
    }

    removeCraft(index: number, dayIndex: number, workshopIndex: number){
        this.days[dayIndex].workshops[workshopIndex].crafts.splice(index, 1);
        this.update(dayIndex);
    }

    setWorkshopRanks(ranks: number[]){
        this.workshopRanks = ranks;
        this.update();
    }

    setWorkshopRank(workshopIndex: number, rank: number){
        this.workshopRanks[workshopIndex] = rank;
        this.update();
    }

    previewValue(craft: WorkshopItem, dayIndex: number, workshopIndex: number){
        const day = this.days[dayIndex];
        const workshop = day.workshops[workshopIndex];
        const prevItem = workshop.crafts[workshop.crafts.length-1]?.item;
        const bonus = hasEfficiencyBonus(craft, prevItem);

        const value = calculateCraftValue(craft, ffData.workshopRanks[this.workshopRanks[workshopIndex]-1].bonus, this.startingGroove, bonus, getPopularity(craft.craftId, this.demandWeek).bonus);
        return value;
    }

    update(dayIndex: number = 0){
        this.totalAmount = 0;
        let groove = this.startingGroove;
        for(let i=dayIndex; i<this.days.length; i++){
            const day = this.days[i];

            let totalAmount = 0;
            let totalGrooveBonus = 0;
            day.workshops.forEach((workshop, workshopIndex) => {
                let workshopHours = 0;
                let workshopAmount = 0;
                let grooveBonus = 0;
    
                workshop.crafts.forEach((craft, craftIndex) => {
                    craft.bonus = hasEfficiencyBonus(craft.item, workshop.crafts[craftIndex-1]?.item);
                    craft.value = calculateCraftValue(craft.item, ffData.workshopRanks[this.workshopRanks[workshopIndex]-1].bonus, groove, craft.bonus, getPopularity(craft.item.craftId, this.demandWeek).bonus)
                    
                    workshopAmount += craft.value;
                    workshopHours += craft.item.hours;
                    
                    if(craft.bonus){
                        grooveBonus++;
                    }
                });
                workshop.totalAmount = workshopAmount;
                workshop.totalHours = workshopHours;
                totalAmount += workshopAmount;
                totalGrooveBonus += grooveBonus;
            });
            day.totalAmount = totalAmount;
            day.endOfDayGroove = groove + totalGrooveBonus;
            this.totalAmount += day.totalAmount;
        }
        this.onUpdate();
        this.watchValue = {};
    }

    stringify(){
        const data: SaveData = {
            demandWeek: this.demandWeek?.index,
            days: this.days.map(day => {
                return day.workshops.map(workshop => {
                    return workshop.crafts.map(craft => {
                        return craft.item.craftId;
                    });
                })
            })
        }
        return JSON.stringify(data);
    }

    loadFromString(data: string){
        const result = JSON.parse(data) as SaveData;
        this.demandWeek = result.demandWeek !== undefined ? ffData.popularitySchedule[result.demandWeek] : null;
        result.days.forEach((day, dayIndex) => {
            day.forEach((workshop, workshopIndex) => {
                this.days[dayIndex].workshops[workshopIndex].crafts = [];
                workshop.forEach(craftId => {
                    const craft = ffData.workshopItems.find(i => i.craftId===craftId);
                    if(!craft){
                        return;
                    }
                    
                    this.days[dayIndex].workshops[workshopIndex].crafts.push(
                        {
                            item: craft,
                            bonus: false,
                            value: 0
                        }
                    )
                });
            });
        });
        this.update();
    }


    summarizeMaterials(){
        const materials: Map<number, {craft: PouchItem, count: number}> = new Map();

        this.days.forEach(day => {
            day.workshops.forEach(workshop => {
                workshop.crafts.forEach(craft => {
                    craft.item.materials.forEach(material => {
                        let mapMaterial = materials.get(material.item.id);
                        if(!mapMaterial){
                            mapMaterial = {
                                craft: material.item,
                                count: 0
                            };
                            materials.set(material.item.id, mapMaterial);
                        }
                        mapMaterial.count += material.quantity;
                    });
                });
            });
        });
        return Array.from(materials.values());
    }
}

interface SaveData{
    demandWeek?: number,
    days: number[][][]
}