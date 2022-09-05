import { CraftingDay, PopularitySchedule, PouchItem, WorkshopItem } from "../models";
import { ffData } from "./ffDataLoader";
import { calculateCraftValue, getPopularity, hasEfficiencyBonus } from "./utils";

export default class CraftingWeek{
    demandWeek: PopularitySchedule|null = null;
    totalAmount: number = 0;
    days: CraftingDay[];
    workshopRanks: number[];
    startingGroove: number = 0;
    maxGroove: number = 0;
    watchValue = {};

    onUpdate: () => void = () => {};

    constructor(){
        this.days = [];
        this.workshopRanks = [1, 1, 1];

        for(let i=0; i<5; i++){
            this.days.push({
                totalAmount: 0,
                grooveHours: [],
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
        this.updateDay();
    }

    setStartingGroove(value: number){
        this.startingGroove = value;
        this.updateDay();
    }

    setMaxGroove(maxGroove: number){
        this.maxGroove = maxGroove;
        this.updateDay();
    }

    addCraft(craft: WorkshopItem, dayIndex: number, workshopIndex: number){
        const day = this.days[dayIndex];
        const workshop = day.workshops[workshopIndex];

        workshop.crafts.push({
            bonus: false,
            item: craft,
            value: craft.value,
            groove: 0
        });
        this.updateDay(dayIndex);
    }

    removeCraft(index: number, dayIndex: number, workshopIndex: number){
        this.days[dayIndex].workshops[workshopIndex].crafts.splice(index, 1);
        this.updateDay(dayIndex);
    }

    setWorkshopRanks(ranks: number[]){
        this.workshopRanks = ranks;
        this.updateDay();
    }

    setWorkshopRank(workshopIndex: number, rank: number){
        this.workshopRanks[workshopIndex] = rank;
        this.updateDay();
    }

    previewValue(craft: WorkshopItem, dayIndex: number, workshopIndex: number){
        const day = this.days[dayIndex];
        const workshop = day.workshops[workshopIndex];
        const prevItem = workshop.crafts[workshop.crafts.length-1]?.item;
        const bonus = hasEfficiencyBonus(craft, prevItem);
        const groove = day.grooveHours[Math.min(day.grooveHours.length-1, workshop.totalHours)];

        const value = calculateCraftValue(craft, ffData.workshopRanks[this.workshopRanks[workshopIndex]-1].bonus, groove, bonus, getPopularity(craft.craftId, this.demandWeek).bonus);
        return value;
    }

    updateDay(dayIndex: number = 0){
        if(dayIndex >= this.days.length){
            this.onUpdate();
            this.watchValue = {};
            return;
        }
        const prevDay = this.days[dayIndex-1];
        
        const day = this.days[dayIndex];
        let initialGroove = prevDay ? prevDay.grooveHours[prevDay.grooveHours.length-1] : this.startingGroove;
        const grooveChanges = [];

        for(const workshop of day.workshops){
            let hour = 0;
            for(let i=0; i<workshop.crafts.length; i++){
                const craft = workshop.crafts[i];
                const prevCraft = workshop.crafts[i-1];
                craft.bonus = hasEfficiencyBonus(craft.item, prevCraft?.item);
                hour += craft.item.hours;
                if(!craft.bonus){
                    const nextCraft = workshop.crafts[i+1];
                    if(hasEfficiencyBonus(craft.item, nextCraft?.item)){
                        grooveChanges.push(hour);
                    }
                } else {
                    grooveChanges.push(hour);
                }
            }
        }
        grooveChanges.sort();

        day.grooveHours = new Array(24).fill(initialGroove);
        grooveChanges.forEach(gh => {
            for(let i=gh; i<day.grooveHours.length; i++){
                day.grooveHours[i] = Math.min(day.grooveHours[i]+1, this.maxGroove);
            }
        });
        let totalAmount = 0;
        day.workshops.forEach((workshop, workshopIndex) => {
            let workshopHours = 0;
            let workshopAmount = 0;

            for(const craft of workshop.crafts){
                const groove = day.grooveHours[workshopHours+craft.item.hours-1];
                craft.value = calculateCraftValue(craft.item, ffData.workshopRanks[this.workshopRanks[workshopIndex]-1].bonus, groove, craft.bonus, getPopularity(craft.item.craftId, this.demandWeek).bonus);
                craft.groove = groove;
                workshopHours += craft.item.hours;
                workshopAmount += craft.value;
            }
            workshop.totalAmount = workshopAmount;
            workshop.totalHours = workshopHours;

            totalAmount += workshop.totalAmount;
        });
        day.totalAmount = totalAmount;

        this.updateDay(dayIndex+1);
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
                            value: 0,
                            groove: 0
                        }
                    )
                });
            });
        });
        this.updateDay();
    }

    reset(){
        this.demandWeek = null;
        this.days.forEach(day => {
            day.workshops.forEach(workshop => {
                workshop.crafts = [];
            });
        });
        this.updateDay();
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
        return Array.from(materials.values()).sort((a, b) => a.craft.pouchId - b.craft.pouchId);
    }
}

interface SaveData{
    demandWeek?: number,
    days: number[][][]
}