import { useState } from "preact/hooks";
import { PopularitySchedule } from "../models";
import CraftingWeek from "../services/craftingWeek";
import DemandSelector from "./demandSelector";
import "./weekSchedule.scss";
import WeekSummary from "./weekSummary";
const DAYS = new Array(5).fill(0).map((_, i) => i);

interface IProps{
    label: string;
    selected: number;
    week: CraftingWeek;
    selectDay: (index: number) => void;
    setDemand: (week: PopularitySchedule|null) => void;
}

export default function WeekSchedule({label, week, selected, selectDay, setDemand}: IProps){
    const [modalOpen, setModalOpen] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);

    return (
        <div class="week-schedule">
            <div class="week-summary">
                <div class="week-title">
                    <span class="week-label">{label}</span>
                    <div class="demand-button">
                        <button onClick={() => setModalOpen(true)}>Set Demand</button>
                    </div>
                </div>
                <div class="week-days">
                    {DAYS.map(d => (
                        <div class={selected === d ? "selected" : ""} onClick={() => selectDay(d)}></div>
                    ))}
                </div>
                <div>
                    <button onClick={() => setSummaryOpen(true)}>Details</button>
                    <WeekSummary week={week} open={summaryOpen} close={() => setSummaryOpen(false)}/>
                </div>
            </div>
            <DemandSelector open={modalOpen} close={() => setModalOpen(false)} setDemand={setDemand} />
        </div>
    );
}