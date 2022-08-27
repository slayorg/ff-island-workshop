import popIcon0 from "url:../assets/pop0.png";
import popIcon1 from "url:../assets/pop1.png";
import popIcon2 from "url:../assets/pop2.png";
import popIcon3 from "url:../assets/pop3.png";

const ICONS = [
    popIcon0,
    popIcon1,
    popIcon2,
    popIcon3
];

export default function PopIcon({value}:{value: number}){
    return (
        <div class="pop-icon">
            <img src={ICONS[value-1]} alt="" />
        </div>
    )
}