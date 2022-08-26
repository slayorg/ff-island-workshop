import "./craftPicker.scss";
import { useMemo } from "preact/hooks";
import { WorkshopItem } from "../models";
import ItemIcon from "./itemIcon";

import upArrow from "url:../assets/uparrow.png";

function CraftRow({item}: {item: WorkshopItem}){
    return (
        <div class="craft-row">
            <div><img src={upArrow} /></div>
            <ItemIcon item={item} />
            <div>{item.name}</div>
            <div>
                {item.categories.map(c => (<div>{c}</div>))}
            </div>
            <div>
                {item.materials.map(m => (<div>
                    <ItemIcon item={m.item} />
                    <div>{m.item.name}</div>
                    <div>{m.quantity}</div>
                </div>))}
            </div>
        </div>
    );
}

export default function craftPicker({prevItem, items, open, close}: {prevItem: WorkshopItem|null, items: WorkshopItem[], open: boolean, close: () => void}){
    
    let [efficiencyItems, regularItems] = useMemo(() => {
        let efficiencyItems: WorkshopItem[] = [];
        let regularItems: WorkshopItem[] = [];
        if(prevItem){
            items.forEach(i => {
                console.log("testing item " + i.name);
                for(let n=0; n<prevItem.categories.length; n++){
                    for(let m=0; m<i.categories.length; m++){
                        if(i.categories[m] === prevItem.categories[n]){
                            console.log("/tadd item to efficiency list");
                            efficiencyItems.push(i);
                            return;
                        }
                    }
                }
                console.log("add regular item");
                regularItems.push(i);
            });
        } else {
            regularItems = items;
        }
        return [efficiencyItems, regularItems];
    }, [prevItem, items]);
    
    return (
        <div class="modal">
            <input id="modal_1" type="checkbox" checked={open}/>
            <div class="overlay" onClick={close}></div>
            <article>
                <header>
                    <h3>Workshop Crafts</h3>
                    <a href="#" class="close" onClick={close}>&times;</a>
                </header>
                <section class="content">
                    {efficiencyItems.map(item => <CraftRow key={item.id} item={item}/>)}
                    {regularItems.map(item => <CraftRow key={item.id} item={item}/>)}
                </section>
            </article>
        </div>
    );
}