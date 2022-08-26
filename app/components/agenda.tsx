import "./agenda.scss";
import { SummaryData, WorkshopItem } from "../models";
import ItemIcon from "./itemIcon";
import { useMemo, useState } from "preact/hooks";
import { hasEfficiencyBonus } from "../services/utils";
import TimeBar from "./timeBar";


export default function Agenda({items, summaryData, removeItem}: {workshopItems: WorkshopItem[], items: WorkshopItem[], summaryData: SummaryData, removeItem:(index:number) => void}){


    return (
        <div class="agenda">
            <div class="agenda-summary">
                <div>
                    Total earnings: {summaryData.money}
                </div>
                <div>
                    Hours remaining: {24 - summaryData.hours}
                </div>
            </div>
            <div><TimeBar hours={24} filled={summaryData.hours} /></div>
            <div class="agenda-items">
                {items.map((item, index) => (
                    <div class={"agenda-item " + (summaryData.values[index].bonus ? "eff-bonus":"")}>
                        <div class="item-top">
                            <ItemIcon item={item}/>
                            <div onClick={() => removeItem(index)}><button>&times;</button></div>
                        </div>
                        <div class="item-bottom">{summaryData.values[index].value}</div>
                    </div>
                ))}
            </div>
            
        </div>
    )
}