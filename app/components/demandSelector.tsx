import "./demandSelector.scss";
import { ffData } from "../services/ffDataLoader"
import ItemIcon from "./itemIcon";
import { useEffect, useState } from "preact/hooks";
import { PopularitySchedule } from "../models";

export default function DemandSelector({open, close, setDemand}: {open:boolean, close: () => void, setDemand: (value: PopularitySchedule|null) => void}){
    const data = ffData.workshopItems.slice(0, 6);
    const [itemPops, setItemPops] = useState<{id: number, pop: number}[]>([
        {id: 1, pop: 0},
        {id: 2, pop: 0},
        {id: 3, pop: 0},
        {id: 4, pop: 0},
        {id: 5, pop: 0},
        {id: 6, pop: 0}
    ]);
    const [weeks, setWeeks] = useState<PopularitySchedule[]>([]);

    function findPopularityWeek(crafts: ({id: number, pop: number}|undefined)[]){
        const weeks = ffData.popularitySchedule.filter((v) => {
            for(let n=0; n<crafts.length;n++){
                const craft = crafts[n];
                if(!craft){
                    continue;
                }
                if(craft.pop !== 0 && v.data[craft.id] !== craft.pop){
                    return false;
                }
            }
            return true;
        });
        return weeks;
    }

    const onPopSelect = (craftId: number, popularity: number) => {
        const arr = [...itemPops];
        arr[craftId-1].pop = popularity;
        setItemPops(arr);
    }

    const clearItemPops = () => {
        setItemPops(itemPops.map(i => ({...i, pop: 0})));
        setDemand(null);
    }

    useEffect(() => {
        if(open){
            const weeks = findPopularityWeek(itemPops)
            setWeeks(weeks);
            if(weeks.length === 1){
                setDemand(weeks[0]);
            }
        }
    }, [itemPops, open])
    
    return (
        <div class="modal">
            <input id="modal_1" checked={open} type="checkbox" />
            <div class="overlay" onClick={close}></div>
            <article>
                <header>
                    <h3>Find Demand Schedule</h3>
                    <span onClick={close} class="close">&times;</span>
                </header>
                <section class="content demand-selector">
                    {weeks.length > 1 && itemPops.length > 0 && (
                        <div class="demand-info">There are {weeks.length} schedule matches</div>
                    )}
                    {weeks.length === 1 && (
                        <div class="demand-info">Demand schedule matched!</div>
                    )}
                    {weeks.length === 0 && itemPops.length > 0 && (
                        <div class="demand-info">Failed to find demand schedule. Check for errors.</div>
                    )}
                    {itemPops.length === 0 && (
                        <div class="demand-info">Pick current week's popularities:</div>
                    )}
                    <div class="items">
                        {data.map(item => (
                            <div>
                                <ItemIcon item={item} />
                                <select value={itemPops[item.craftId-1].pop} onChange={(ev) => onPopSelect(item.craftId, parseInt(ev.currentTarget.value))}>
                                    <option value={0}>Pick Popularity</option>
                                    {ffData.popularityValues.map(value => (
                                        <option value={value.value}>{value.name}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </section>
                <footer>
                    <button onClick={clearItemPops}>Clear Popularity</button>
                </footer>
            </article>
        </div>
    )
}