import "./weekSummary.scss";
import { useMemo } from "preact/hooks";
import CraftingWeek from "../services/craftingWeek";
import ItemIcon from "./itemIcon";


export default function WeekSummary({week, open, close}: {week: CraftingWeek, open: boolean, close:() => void}){

    const materialList = useMemo(() => {
        return week.summarizeMaterials();
    }, [week, open]);

    return (
        <div class="modal">
            <input id="week-modal" checked={open} type="checkbox" />
            <div class="overlay" onClick={close}></div>
            <article>
                <header>
                    <h3>Week Details</h3>
                    <span onClick={close} class="close">&times;</span>
                </header>
                <section class="content week-summary">
                    <div class="week-total">
                        <div>Total:</div>
                        <div>{week.totalAmount}</div>
                    </div>
                    <table class="week-summary-table">
                        <tbody>
                            {materialList.map(mat => (
                                <tr>
                                    <td class="item-name-icon"><ItemIcon item={mat.craft} />{mat.craft.name}</td>
                                    <td class="item-value">{mat.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </article>
        </div>
    );
}