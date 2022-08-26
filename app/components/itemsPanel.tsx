import { SummaryData, WorkshopItem } from "../models";
import ItemIcon from "./itemIcon";
import "./itemsPanel.scss";

import { useMemo } from "preact/hooks";
import TimeBar from "./timeBar";
import { hasEfficiencyBonus } from "../services/utils";

function ItemRow({item, bonus, onAdd, disabled}: {item: WorkshopItem, bonus?: boolean, onAdd:() => void, disabled: boolean}){
    return (
        <div class={"item-row " + (bonus ? "has-bonus ":"") + (disabled ? "disabled":"")}>
            <div class="item-info">
                <div class="add-button">
                    <button disabled={disabled} onClick={onAdd}>+</button>
                </div>
                <div>
                    <ItemIcon item={item} />
                </div>
                
                <div class="item-name">{item.name}</div>
                <div class="item-hours">
                    <div class="item-hours-number">{item.hours}h</div>
                    <TimeBar hours={item.hours} emptyColor={"rgb(66, 228, 66)"}/>
                </div>
                <div class="item-value">
                    <div>{bonus? item.value*2 : item.value}</div>
                    <div>{bonus? `(${item.value})`:""}</div>
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
        </div>
    )
}

export default function ItemsPanel({items, prevItem, addItem, summaryData}: {items: WorkshopItem[],summaryData: SummaryData, prevItem: WorkshopItem, addItem:(item: WorkshopItem) => void}){
    const remainingHours = 24 - summaryData.hours;

    let [efficiencyItems, regularItems] = useMemo(() => {
        let efficiencyItems: WorkshopItem[] = [];
        let regularItems: WorkshopItem[] = [];
        if(prevItem){
            items.forEach(i => {
                if(i.hours <= remainingHours){
                    hasEfficiencyBonus(i, prevItem) ? efficiencyItems.push(i) : regularItems.push(i);
                }
            });
        } else {
            regularItems = items;
        }
        return [efficiencyItems, regularItems];
    }, [prevItem, items, summaryData]);

    

    return (
        <div class="items-panel">
            <div class="header-options">

            </div>
            <div class="items">
                {efficiencyItems.map(i => <ItemRow key={i.id} item={i} bonus onAdd={() => addItem(i)} disabled={remainingHours < i.hours}/>)}
                {regularItems.map(i => <ItemRow key={i.id} item={i} onAdd={() => addItem(i)} disabled={remainingHours < i.hours} />)}
            </div>
        </div>
    )
}