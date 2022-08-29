import "./agenda.scss";
import ItemIcon from "./itemIcon";
import TimeBar from "./timeBar";
import { ffData } from "../services/ffDataLoader";
import CraftingWeek from "../services/craftingWeek";

interface IProps{
    week: CraftingWeek;
    workshopIndex: number;
    dayIndex: number;
    selected: boolean;
    updateWorkshopRank: (workshopIndex: number, rank: number) => void;
    onSelect: () => void;
}

export default function WorkshopComponent({week, workshopIndex, dayIndex, selected, updateWorkshopRank, onSelect}: IProps){
    const day = week.days[dayIndex];
    const workshop = day.workshops[workshopIndex];
    return (
        <div class={"agenda " + (selected ? "selected":"")}>
            <div class="agenda-summary">
                <div class="workshop-label" onClick={onSelect}>
                    Workshop {workshopIndex+1}
                </div>
                <div class="workshop-rank">
                    <span>Rank</span>
                    <select value={week.workshopRanks[workshopIndex]} onChange={(ev) => updateWorkshopRank(workshopIndex, parseInt(ev.currentTarget.value))}>
                        {
                            ffData.workshopRanks.map(r => (
                                <option value={r.rank}>{r.rank}</option>
                            ))
                        }
                    </select>
                </div>
                <div class="workshop-amount">
                    {workshop.totalAmount}
                </div>
                <div class="workshop-bar">
                    
                    <TimeBar hours={24} filled={workshop.totalHours} />
                </div>
            </div>
            <div class="agenda-items">
                {workshop.crafts.map((craft, index) => (
                    <div class={"agenda-item tooltip-bottom " + (craft.bonus ? "eff-bonus":"")} data-tooltip={craft.item.name}>
                        <ItemIcon item={craft.item}/>
                        <div class="item-value">{craft.value}</div>
                        <button onClick={() => week.removeCraft(index, dayIndex, workshopIndex)}>&times;</button>
                    </div>
                ))}
            </div>
        </div>
    )
}