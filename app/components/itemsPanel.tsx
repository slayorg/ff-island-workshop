import { WorkshopItem } from "../models";
import ItemIcon from "./itemIcon";
import "./itemsPanel.scss";

import TimeBar from "./timeBar";
import { getPopularity, hasEfficiencyBonus } from "../services/utils";
import { ffData } from "../services/ffDataLoader";
import PopIcon from "./popIcon";
import CraftingWeek from "../services/craftingWeek";


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
                    {value || item.value}
                </div>
                <div class="item-value">
                    {((value || item.value)/item.hours).toFixed(1)}/h
                </div>
                <div class="item-pop">
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
    week: CraftingWeek;
    dayIndex: number;
    workshopIndex: number;
    tier: number;
    updateSupply: (item: WorkshopItem, supplyIndex: number) => void;
};

export default function ItemsPanel({week, dayIndex, workshopIndex, tier, updateSupply}: ItemsPanelProps ){
    const workshop = week.days[dayIndex].workshops[workshopIndex];
    const remainingHours = 24 - workshop.totalHours;

    /*let [efficiencyItems, regularItems] = useMemo(() => {
        let efficiencyItems: WorkshopItem[] = [];
        let regularItems: WorkshopItem[] = [];
        const prevItem = workshop.crafts[workshop.crafts.length-1];
        if(prevItem){
            ffData.workshopItems.forEach(i => {
                if(i.hours > remainingHours){
                    return;
                }
                if(i.tier > tier){
                    return;
                }
                hasEfficiencyBonus(i, prevItem.item) ? efficiencyItems.push(i) : regularItems.push(i);
            });
        } else {
            regularItems = ffData.workshopItems.filter(i => i.tier <= tier);
        }
        return [efficiencyItems, regularItems];
    }, [workshop, tier, week.watchValue]);*/


    const craftItems = ffData.workshopItems.map(v => ({
        item: v,
        bonus: hasEfficiencyBonus(v, workshop.crafts[workshop.crafts.length-1]?.item),
        visible: v.tier <= tier && v.hours <= remainingHours
    })).sort((a, b) => {
        if(a.visible === b.visible){
            return a.bonus ? -1 : 1;
        }
        return a.visible ? -1 : 1;
    });

    return (
        <div class="items-panel">
            <div class="items">
                {craftItems.map(i => <ItemRow key={i.item.id} item={i.item} bonus={i.bonus} onAdd={() => week.addCraft(i.item, dayIndex, workshopIndex)} disabled={!i.visible} value={week.previewValue(i.item, dayIndex, workshopIndex)} popularity={getPopularity(i.item.craftId, week.demandWeek)} updateSupply={(value) => updateSupply(i.item, value)}/>)}
            </div>
        </div>
    )
}