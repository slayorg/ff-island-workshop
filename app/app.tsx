import { useEffect, useMemo, useReducer, useState } from "preact/hooks";
import Agenda from "./components/agenda";
import ItemsPanel from "./components/itemsPanel";
import AgendaReducer from "./reducers/agendaReducer";
import loadFFData from "./services/ffDataLoader";
import { hasEfficiencyBonus } from "./services/utils";

const ffData = loadFFData();
console.log(ffData);

const tiers = new Array(10).fill(0).map((_, index) => {
    return index+1;
});

export default function App(){
    const [tier, setTier] = useState(1);
    const [workshopRank, setWorkshopRank] = useState<(typeof ffData)["workshopRanks"][0]>(ffData.workshopRanks[0]);
    const [agendaItems, dispatch] = useReducer(AgendaReducer, []);

    const summaryData = useMemo(() => {
        const agendaValues = agendaItems.map((item, index) => {
            let value = item.value;
            let effBonus = hasEfficiencyBonus(item, agendaItems[index-1])
            value = effBonus ? item.value*2: item.value;
            value *= (workshopRank.bonus/100);
            return {value: Math.floor(value),bonus: effBonus};
        });
        const totalMoney = agendaValues.length > 0 ? agendaValues.map(v => v.value).reduce((a, b) => a + b) : 0;
        const totalHours = agendaItems.length> 0 ? agendaItems.map(i => i.hours).reduce((a, b) => a + b) : 0;

        return {
            hours: totalHours,
            money: totalMoney,
            values: agendaValues
        };
    }, [agendaItems, workshopRank]);

    const workshopItems = useMemo(() => {
        return ffData.workshopItems.filter(i => i.tier <=tier);
    }, [tier]);

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
                </div>
                
            </nav>
            <div class="app-body">
                <Agenda workshopItems={workshopItems} items={agendaItems} summaryData={summaryData} removeItem={(index) => dispatch({type: "remove", index})}/>
                <ItemsPanel prevItem={agendaItems.slice(-1)?.[0]} items={workshopItems} summaryData={summaryData} addItem={(item) => dispatch({type: "add", item: item})}/>
            </div>
        </>
    )
}