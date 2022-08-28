import { useState } from "preact/hooks";
import DemandSelector from "./demandSelector";
import "./weekSchedule.scss";
const DAYS = new Array(5).fill(0).map((_, i) => i);

interface IProps{
    label: string;
    selected: number;
    selectDay: (index: number) => void;
    setDemand: (value: number) => void;
}

export default function WeekSchedule({label, selected, selectDay, setDemand}: IProps){
    const [modalOpen, setModalOpen] = useState(false);

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
            </div>
            <DemandSelector open={modalOpen} close={() => setModalOpen(false)} setDemand={setDemand} />
        </div>
    );
}