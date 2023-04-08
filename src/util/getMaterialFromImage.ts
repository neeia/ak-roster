import {DeportRecognizer, toSimpleTrustedResult} from "@arkntools/depot-recognition";
import {sortBy} from "lodash";
import itemsJson from "data/items.json";
import {Item} from "../types/item";


export async function getMaterialsFromImage(fileList : File[]) :  Promise<Record<string, number | undefined>[]>
{
  const items = itemsJson as { [id: string] :  Item };
  const getSortId = (id : string) => items[id].sortId;
  const order = sortBy(Object.keys(items).filter(getSortId), getSortId);
  // replace the URL with a more stable link
  const pkg = await fetch('https://raw.githubusercontent.com/yesod30/ak-roster/feature/data-import-export/src/data/items.zip').then((res) => res.arrayBuffer())
  const dr = new DeportRecognizer({ order, pkg});
  const result = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const url = URL.createObjectURL(file);
    const data = (await dr.recognize(url, (step) => console.log(step)) ).data;
    const simpleData = toSimpleTrustedResult(data);
    result.push(simpleData);
    URL.revokeObjectURL(url);
  }
  return result;
}
