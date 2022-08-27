import { CraftResults, FFData, WorkshopItem } from "../models";
import ItemIcon from "./itemIcon";
import "./itemsPanel.scss";

import { useMemo } from "preact/hooks";
import TimeBar from "./timeBar";
import { calculateCraftValue, getPopularity, hasEfficiencyBonus } from "../services/utils";
import { ffData } from "../services/ffDataLoader";
import PopIcon from "./popIcon";


interface ItemRowProps {
    item: WorkshopItem;
    value?: number;
    bonus?: boolean;
    popularity: typeof ffData["popularityValues"][0];
    onAdd: () => void; 
    disabled: boolean;
    updateSupply: (supplyIndex: number) => void;
};

function ItemRow({item, bonus, onAdd, disabled, value, popularity, updateSupply}: ItemRowProps){
    return (
        <div class={"item-row " + (bonus ? "has-bonus ":"") + (disabled ? "disabled":"")}>
            <div class="item-info">
                <div class="add-button">
                    <button disabled={disabled} onClick={onAdd}>+</button>
                </div>
                <div>
                    <ItemIcon item={item} />
                </div>
                
                <div class="item-title">
                    <div class="item-name">{item.name}</div>
                    <div class="item-categories">{item.categories.map(c => <div>{c}</div>)}</div>
                </div>
                <div class="item-hours">
                    <div class="item-hours-number">{item.hours}h</div>
                    <TimeBar hours={item.hours} emptyColor={"rgb(66, 228, 66)"}/>
                </div>
                <div class="item-value">
                    <div>{value || item.value}</div>
                    <PopIcon value={popularity.value} />
                </div>
            </div>
            <div class="item-materials">
                { item.materials.map(m => (
                    <div key={m.item.id} class="material-item">
                        <div class="material-icon">
                            <ItemIcon item={m.item} />
                        </div>
                        <div class="material-name">
                            {m.item.name}
                        </div>
                        <div class="material-quantity">
                            {m.quantity}
                        </div>
                    </div>
                ))}
            </div>
            <div class="item-options">
                <span>Supply: </span>
                <select value={item.supply.value} onChange={(ev) => updateSupply(parseInt(ev.currentTarget.value))}>
                    { ffData.supplyValues.map((s, i) => (
                        <option value={i}>{s.name} x{(s.bonus/100).toFixed(2)}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}

interface ItemsPanelProps {
    craftList: CraftResults;
    bonuses: {
        groove: number;
        workshop: number;
        popularityWeek: number;
    },
    addItem: (item: WorkshopItem) => void;
    updateSupply: (item: WorkshopItem, supplyIndex: number) => void;
};

export default function ItemsPanel({addItem, craftList, bonuses, updateSupply}: ItemsPanelProps ){
    const remainingHours = 24 - craftList.hours;

    let [efficiencyItems, regularItems] = useMemo(() => {
        let efficiencyItems: WorkshopItem[] = [];
        let regularItems: WorkshopItem[] = [];
        const prevItem = craftList.items.slice(-1)[0];
        if(prevItem){
            ffData.workshopItems.forEach(i => {
                if(i.hours <= remainingHours){
                    hasEfficiencyBonus(i, prevItem.item) ? efficiencyItems.push(i) : regularItems.push(i);
                }
            });
        } else {
            regularItems = ffData.workshopItems;
        }
        return [efficiencyItems, regularItems];
    }, [craftList]);

    return (
        <div class="items-panel">
            <div class="items">
                {efficiencyItems.map(i => <ItemRow key={i.id} item={i} bonus onAdd={() => addItem(i)} disabled={remainingHours < i.hours} value={calculateCraftValue(i, bonuses.workshop, bonuses.groove, true, getPopularity(i.craftId, bonuses.popularityWeek).bonus)} popularity={getPopularity(i.craftId, bonuses.popularityWeek)} updateSupply={(value) => updateSupply(i, value)}/>)}
                {regularItems.map(i => <ItemRow key={i.id} item={i} onAdd={() => addItem(i)} disabled={remainingHours < i.hours} value={calculateCraftValue(i, bonuses.workshop, bonuses.groove, false, getPopularity(i.craftId, bonuses.popularityWeek).bonus)} popularity={getPopularity(i.craftId, bonuses.popularityWeek)} updateSupply={(value) => updateSupply(i, value)}/>)}
            </div>
        </div>
    )
}