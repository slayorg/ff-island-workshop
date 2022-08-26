import "./timeBar.scss";
import { JSX } from "preact/jsx-runtime";

export default function TimeBar({hours, filled, emptyColor, fillColor}:{hours: number, filled?: number, emptyColor?: string, fillColor?:string}){
    const colors = [emptyColor||"white", fillColor||"grey"];
    const fillCount = filled || 0;
    const elements: JSX.Element[] = [];
    for(let i=0; i<hours; i++){
        elements.push(
            <div key={i} style={{backgroundColor: i < fillCount? colors[1]:colors[0]}}></div>
        );
    }
    return (
        <div class="time-bar">
          {elements}
        </div>
    )
}