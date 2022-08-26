import { AgendaItem, WorkshopItem } from "../models";
import { hasEfficiencyBonus } from "../services/utils";

type AddAction = {type: "add", item: WorkshopItem};
type RemoveAction = {type: "remove", index: number};
type Actions = AddAction | RemoveAction;

export default function AgendaReducer(state: WorkshopItem[], action:Actions): WorkshopItem[]{
    switch (action.type){
        case "add":
            return [...state, action.item];
        case "remove":
            return [...state.slice(0, action.index), ...state.slice(action.index+1)];
    }
}