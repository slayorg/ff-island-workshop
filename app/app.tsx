import { useMemo, useReducer, useState } from "preact/hooks";
import Agenda from "./components/agenda";
import ItemsPanel from "./components/itemsPanel";
import { FFData, WorkshopItem } from "./models";
import AgendaReducer from "./reducers/agendaReducer";
import {ffData} from "./services/ffDataLoader";
import { processCraftList } from "./services/utils";


console.log(ffData);

const tiers = new Array(10).fill(0).map((_, index) => {
    return index+1;
});

export default function App(){
    const [tier, setTier] = useState(1);
    const [workshopRank, setWorkshopRank] = useState(ffData.workshopRanks[0]);
    const [groove, setGroove] = useState(0);
    const [week, setWeek] = useState(25);
    const [updateValue, update] = useState({});

    const [agendaItems, dispatch] = useReducer(AgendaReducer, []);

    const craftList = useMemo(() => {
        return processCraftList(agendaItems, { groove: groove, workshopBonus: workshopRank.bonus, popularityWeek: week});
    }, [agendaItems, workshopRank, groove, week, updateValue]);

    const workshopItems = useMemo(() => {
        return ffData.workshopItems.filter(i => i.tier <=tier);
    }, [tier]);

    const updateSupply = (item: WorkshopItem, supplyIndex:number) => {
        item.supply = ffData.supplyValues[supplyIndex];
        update({});
    }

    return (
        <>
            <nav>
                <div class="brand">
                    <span>Island Sanctuary Workshop Planner</span>
                </div>
                <div class="nav-options">
                    <div>
                        <select onChange={(ev) => setTier(parseInt(ev.currentTarget.value))}>
                            {tiers.map(m => (
                                <option value={m}>Sanctuary Rank {m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select onChange={(ev) => setWorkshopRank(ffData.workshopRanks.find(w => w.rank === parseInt(ev.currentTarget.value))||ffData.workshopRanks[0])}>
                            {ffData.workshopRanks.map(m => (
                                <option value={m.rank}>Workshop Rank {m.rank} +{m.bonus-100}%</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <span>Groove: </span>
                        <input type="number" min="0" max="45" value={groove} onChange={(ev) => setGroove(ev.currentTarget.valueAsNumber)} />
                    </div>
                    <div>
                        <select onChange={(ev) => setWeek(parseInt(ev.currentTarget.value))} value={week}>
                            {ffData.popularitySchedule.map((s, i) => (
                                <option value={i.toString()}>Week {i}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
            </nav>
            <div class="app-body">
                <Agenda workshopItems={workshopItems} craftList={craftList} removeItem={(index) => dispatch({type: "remove", index})}/>
                <ItemsPanel craftList={craftList} bonuses={{groove, workshop: workshopRank.bonus, popularityWeek: week}} addItem={(item) => dispatch({type: "add", item: item})} updateSupply={updateSupply}/>
            </div>
        </>
    )
}