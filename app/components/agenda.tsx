import "./agenda.scss";
import { CraftResults, WorkshopItem } from "../models";
import ItemIcon from "./itemIcon";
import { useMemo, useState } from "preact/hooks";
import { hasEfficiencyBonus } from "../services/utils";
import TimeBar from "./timeBar";


export default function Agenda({craftList, removeItem}: {craftList: CraftResults, removeItem:(index:number) => void}){


    return (
        <div class="agenda">
            <div class="agenda-summary">
                <div>
                    Total earnings: {craftList.money}
                </div>
                <div>
                    Hours remaining: {24 - craftList.hours}
                </div>
            </div>
            <div><TimeBar hours={24} filled={craftList.hours} /></div>
            <div class="agenda-items">
                {craftList.items.map((item, index) => (
                    <div class={"agenda-item " + (item.efficiencyBonus ? "eff-bonus":"")}>
                        <div class="item-top">
                            <ItemIcon item={item.item}/>
                            <div onClick={() => removeItem(index)}><button>&times;</button></div>
                        </div>
                        <div class="item-bottom">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}