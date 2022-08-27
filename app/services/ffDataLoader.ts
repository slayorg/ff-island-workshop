import { FFData, PouchItem, WorkshopItem } from "../models";

import workshopItemData from "../../data/workshop_items.json";
import pouchItemData from "../../data/pouch_items.json";

import MJIItemPouch from "bundle-text:../../data/MJIItemPouch.csv";
import MJICraftworksObject from "bundle-text:../../data/MJICraftworksObject.csv";
import MJICraftworksObjectTheme from "bundle-text:../../data/MJICraftworksObjectTheme.csv";
import MJICraftworksRankRatio from "bundle-text:../../data/MJICraftworksRankRatio.csv";

import MJICraftworksPopularityType from "bundle-text:../../data/MJICraftworksPopularityType.csv";
import MJICraftworksSupplyDefine from "bundle-text:../../data/MJICraftworksSupplyDefine.csv";

import MJICraftworksPopularity from "bundle-text:../../data/MJICraftworksPopularity.csv";

const itemPouchCSV = readCsv(MJIItemPouch);
const workshopObjectCSV = readCsv(MJICraftworksObject);
const workshopObjectThemeCSV = readCsv(MJICraftworksObjectTheme);
const workshopRankRatio = readCsv(MJICraftworksRankRatio);
const popularityValues = readCsv(MJICraftworksPopularityType);
const supplyValues = readCsv(MJICraftworksSupplyDefine);

const popularitySchedule = readCsv(MJICraftworksPopularity);

function readCsv(data: string){
    return data.split(/\n/).map(l => l.split(","));
}

const SUPPLY_NAMES = [
    "Nonexistant",
    "Insufficient",
    "Sufficient",
    "Surplus",
    "Overflowing",
];
const POPULARITY_NAMES = [
    "Very High",
    "High",
    "Average",
    "Low",
];



function loadFFData(){
    const data: FFData = {
        workshopItems: [],
        pouchItems: [],
        categories: new Map(),
        workshopRanks: [],
        supplyValues: [],
        popularityValues: [],
        popularitySchedule: []
    };

    for(let i=4; i<workshopRankRatio.length; i++){
        const row = workshopRankRatio[i];
        if(row.length === 0){
            continue;
        }
        data.workshopRanks.push({
            rank: parseInt(row[0]),
            bonus: parseInt(row[1])
        });
    }

    for(let i=3; i<supplyValues.length; i++){
        const row = supplyValues[i];
        if(row.length === 0){
            continue;
        }
        data.supplyValues.push({
            value: parseInt(row[0]),
            name: SUPPLY_NAMES[parseInt(row[0])],
            bonus: parseInt(row[2]),
        });
    }

    for(let i=4; i<popularityValues.length; i++){
        const row = popularityValues[i];
        if(row.length === 0){
            continue;
        }
        data.popularityValues.push({
            value: parseInt(row[0]),
            name: POPULARITY_NAMES[parseInt(row[0])-1],
            bonus: parseInt(row[1]),
        });
    }

    for(let i=3; i<popularitySchedule.length; i++){
        const row = popularitySchedule[i];
        if(row.length === 0){
            continue;
        }
        const weekData: number[] = row.slice(1).map(v => parseInt(v));
        data.popularitySchedule.push(weekData);
    }

    for(let i=3; i<itemPouchCSV.length; i++){
        const row = itemPouchCSV[i];
        if(row.length === 0){
            continue;
        }
        const item = pouchItemData.Results.find(it => it.ID === parseInt(row[1]));
        if(!item){
            continue;
        }
        data.pouchItems.push({
            id: item.ID,
            name: item.Name,
            icon: item.Icon,
            pouchId: parseInt(row[0])
        });
    }

    for(let i=4; i<workshopObjectThemeCSV.length; i++){
        const row = workshopObjectThemeCSV[i];
        if(row.length === 0){
            continue;
        }
        data.categories.set(parseInt(row[0]), row[1].trim().slice(1, -1))
    }

    for(let i=3; i<workshopObjectCSV.length; i++){
        const row = workshopObjectCSV[i];
        if(row.length === 0){
            continue;
        }
        const id = parseInt(row[1]);
        if(id === 0){
            continue;
        }
        const item = workshopItemData.Results.find(it => it.ID === id);
        if(!item){
            console.warn("Failed to retrieve item " + id);
            continue;
        }
        const itemCategories = new Array(3).fill(0).map((_, index) => {
            return data.categories.get(parseInt(row[2 + index])) || null;
        }).filter(c => c !== null) as string[];

        const materials: WorkshopItem["materials"] = [];
        for(let n=0; n<4; n++){
            const itemIndex = parseInt(row[5 + (n*2)]);
            const itemQuantity = parseInt(row[5 + (n*2) + 1]);
            if(itemQuantity === 0){
                continue;
            }
            const materialItem = data.pouchItems.find(it => it.pouchId === itemIndex);
            if(materialItem){
                materials.push({
                    item: materialItem,
                    quantity: itemQuantity
                });
            } else {
                console.error("Failed to get material " + itemIndex);
            }
            
        }

        data.workshopItems.push({
            craftId: parseInt(row[0]),
            id: item.ID,
            name: item.Name,
            icon: item.Icon,
            categories: itemCategories,
            materials: materials,
            tier: parseInt(row[13]),
            hours: parseInt(row[14]),
            value: parseInt(row[15]),

            supply: data.supplyValues[2]
        });
    }
    return data;
}

export const ffData = loadFFData();