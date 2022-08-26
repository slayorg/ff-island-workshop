import "./itemIcon.scss";
import { Item } from "../models";

export default function ItemIcon({item}: {item: Item}){
    return (
        <div class="item-icon">
            <img src={"https://xivapi.com/" + item.icon} />
        </div>
    );
}