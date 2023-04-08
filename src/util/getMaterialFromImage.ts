import {DeportRecognizer, isTrustedResult, toSimpleTrustedResult} from "@arkntools/depot-recognition";
import {sortBy} from "lodash";
import itemsJson from "data/items.json";
import {Item} from "../types/item";

export async function getMaterialsFromImage()
{
  const items = itemsJson as { [id: string] :  Item };
  const getSortId = (id : string) => items[id].sortId;
  const order = sortBy(Object.keys(items).filter(getSortId), getSortId);
  // const pkg = await fsPromises.readFile("data/items.zip")

  const [pkg] = await Promise.all(
    [
      'https://github.com/arkntools/arknights-toolbox/raw/master/src/assets/pkg/item.pkg',
    ].map((url) =>
      fetch(url).then((r) => (r.arrayBuffer()))
    )
  );

  const dr = new DeportRecognizer({ order, pkg});
  const { data } = await dr.recognize(
    'https://github.com/arkntools/depot-recognition/raw/main/test/cases/cn_iphone12_0/image.png'
  );
  console.log(data.filter(isTrustedResult)); // full trust result
  console.log(toSimpleTrustedResult(data)); // simple trust result
}