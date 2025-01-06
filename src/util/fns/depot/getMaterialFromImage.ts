import { DeportRecognizer, toSimpleTrustedResult } from "@arkntools/depot-recognition";
import { sortBy } from "lodash";
import itemsJson from "data/items.json";
import { Item } from "../../../types/item";
import { expose } from "comlink";

async function getMaterialsFromImage(fileList: File[]): Promise<Record<string, number | undefined>[]> {
  const items = itemsJson as { [id: string]: Item };
  const getSortId = (id: string) => items[id].sortId;
  const order = sortBy(Object.keys(items).filter(getSortId), getSortId);

  const md5 = (await fetch("https://data-cf.arkntools.app/check.json").then((response) => response.json()))["mapMd5"];
  const pkgFile = (await fetch(`https://data-cf.arkntools.app/map.${md5}.json`).then((response) => response.json()))["pkg/item.zip"];
  const pkg = await fetch(`https://data-cf.arkntools.app/pkg/item.${pkgFile}.zip`).then((res) => res.arrayBuffer());

  const dr = new DeportRecognizer({ order, pkg });
  const result = [];
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const url = URL.createObjectURL(file);
    const data = (await dr.recognize(url)).data;
    const simpleData = toSimpleTrustedResult(data);
    result.push(simpleData);
    URL.revokeObjectURL(url);
  }
  return result;
}

const materialWorker = {
  getMaterialsFromImage: async (fileList: File[]) => {
    return await getMaterialsFromImage(fileList);
  },
};

export type MaterialWorker = typeof materialWorker;

expose(materialWorker);
