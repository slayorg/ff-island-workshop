import { useEffect, useState } from "preact/hooks";
import WorkshopComponent from "./components/workshopComponent";
import ItemsPanel from "./components/itemsPanel";
import WeekSchedule from "./components/weekSchedule";
import { WorkshopItem } from "./models";
import CraftingWeek from "./services/craftingWeek";
import {ffData} from "./services/ffDataLoader";


console.log(ffData);

const tiers = new Array(10).fill(0).map((_, index) => {
    return index+1;
});

let settings = {
    groove: 0,
    landmarkCount: 0,
    workshopCount: 1,
    tier: 1,
    workshopRanks: [1, 1, 1]
};
const savedSettings = localStorage.getItem("settings");

if(savedSettings){
    const data = JSON.parse(savedSettings);

    settings.groove = data.groove;
    settings.landmarkCount = data.landmarkCount;
    settings.workshopCount = data.workshopCount;
    settings.tier = data.tier;
    settings.workshopRanks = data.workshopRanks;
}

const currentWeek = new CraftingWeek();
const nextWeek = new CraftingWeek();

currentWeek.setStartingGroove(settings.groove);

currentWeek.setWorkshopRanks(settings.workshopRanks);
nextWeek.setWorkshopRanks(settings.workshopRanks);

const savedCurrentWeek = localStorage.getItem("currentWeek");
if(savedCurrentWeek){
    currentWeek.loadFromString(savedCurrentWeek);
}
const savedNextWeek = localStorage.getItem("nextWeek");
if(savedNextWeek){
    nextWeek.loadFromString(savedNextWeek);
}

console.log(currentWeek);

function saveSettings(values: typeof settings){
    localStorage.setItem("settings", JSON.stringify({
        landmarkCount: values.landmarkCount,
        workshopCount: values.workshopCount,
        tier: values.tier,
        groove: values.groove,
        workshopRanks: values.workshopRanks
    }));
}

export default function App(){
    const [tier, setTier] = useState(settings.tier);
    const [groove, setGroove] = useState(settings.groove);
    const [landmarkCount, setLandmarkCount] = useState(settings.landmarkCount);
    const [workshopCount, setWorkshopCount] = useState(settings.workshopCount);
    const [selectedDay, setSelectedDay] = useState<[number, number]>([0, 0]);
    const [selectedWorkshop, setSelectedWorkshop] = useState(0);
    const [, update] = useState({});

    useEffect(() => {
        saveSettings({
            landmarkCount,
            workshopCount,
            tier,
            groove,
            workshopRanks: currentWeek.workshopRanks
        });
    }, [tier, groove, landmarkCount, workshopCount]);

    useEffect(() => {
        localStorage.setItem("currentWeek", currentWeek.stringify());
    }, [currentWeek.watchValue]);

    useEffect(() => {
        localStorage.setItem("nextWeek", nextWeek.stringify());
    }, [nextWeek.watchValue]);

    const updateSupply = (item: WorkshopItem, supplyIndex:number) => {
        item.supply = ffData.supplyValues[supplyIndex];
        currentWeek.update();
        nextWeek.update();
    }

    currentWeek.onUpdate = () => {
        update({});
    }
    nextWeek.onUpdate = () => {
        update({});
    }

    const setStartingGroove = (value: number) => {
        setGroove(value);
        currentWeek.setStartingGroove(value);
    }

    const updateWorkshopRank = (workshopIndex: number, rank: number) => {
        currentWeek.setWorkshopRank(workshopIndex, rank);
        nextWeek.setWorkshopRank(workshopIndex, rank);
        saveSettings({
            landmarkCount,
            workshopCount,
            tier,
            groove,
            workshopRanks: currentWeek.workshopRanks
        });
    }

    return (
        <>
            <nav>
                <div class="brand">
                    <span>Island Sanctuary Workshop Planner</span>
                    <label for="info-modal" class="info-icon">?</label>
                </div>
            </nav>
            <div class="app-body">
                <div class="global-settings">
                    <div>
                        <span>Sanctuary Rank</span>
                        <select value={tier} onChange={(ev) => setTier(parseInt(ev.currentTarget.value))}>
                            {tiers.map(m => (
                                <option value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <span>Workshops</span>
                        <select value={workshopCount} onChange={(ev) => setWorkshopCount(parseInt(ev.currentTarget.value))}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </div>
                    <div>
                        <span>Landmarks</span>
                        <select value={landmarkCount} onChange={(ev) => setLandmarkCount(parseInt(ev.currentTarget.value))}>
                            {
                                ffData.landmarkValues.map((value, i) => (
                                    <option value={i}>{i}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div>
                        <span>Groove</span>
                        <input type="number" min="0" max={ffData.landmarkValues[landmarkCount]} value={groove} onChange={(ev) => setStartingGroove(ev.currentTarget.valueAsNumber)} />
                    </div>
                </div>
                <div>
                    <WeekSchedule label="Current week" week={currentWeek} selected={selectedDay[0]===0?selectedDay[1]:-1} selectDay={(day) => setSelectedDay([0, day])} setDemand={v => currentWeek.setDemandWeek(v)}/>
                    <WeekSchedule label="Next week" week={nextWeek} selected={selectedDay[0]===1?selectedDay[1]:-1} selectDay={(day) => setSelectedDay([1, day])} setDemand={v => nextWeek.setDemandWeek(v)}/>
                </div>
                <div class="workshop-groups">
                    {
                        new Array(workshopCount).fill(0).map((_, i) => (
                            <WorkshopComponent week={selectedDay[0]===0? currentWeek: nextWeek} workshopIndex={i} dayIndex={selectedDay[1]} selected={i === selectedWorkshop} updateWorkshopRank={updateWorkshopRank} onSelect={() => setSelectedWorkshop(i)}/>
                        ))
                    }
                </div>
                
                <ItemsPanel week={selectedDay[0]===0? currentWeek: nextWeek} dayIndex={selectedDay[1]} workshopIndex={selectedWorkshop} tier={tier} updateSupply={updateSupply}/>
            </div>

            <div class="modal">
                <input id="info-modal" type="checkbox" />
                <label for="info-modal" class="overlay"></label>
                <article>
                    <section class="content">
                        <div>Made by Slayorg Isaeli @ Faerie</div>
                        <div class="issues-list">
                            <div>Current issues</div>
                            <ul>
                                <li>Groove bonus doesn't increase from crafts, only uses initial groove</li>
                            </ul>
                        </div>
                        <div class="info-dates">
                            <div><a href="https://github.com/slayorg/ff-island-workshop">Source Code</a></div>
                            <div>Updated 2022-08-31</div>
                        </div>
                    </section>
                </article>
            </div>
        </>
    )
}