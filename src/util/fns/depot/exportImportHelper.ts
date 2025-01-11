import itemsJson from "data/items.json";
import itemNameToIdJson from "data/item-name-to-id.json";
import getGoalIngredients from "./getGoalIngredients";
import { Ingredient, Item } from "types/item";
import { wrap } from "comlink";
import { MaterialWorker } from "./getMaterialFromImage";
import GoalData, { getPlannerGoals } from "../../../types/goalData";
import DepotItem from "types/depotItem";

export const SUPPORTED_EXPORT_TYPES: DataShareInfo[] = [
  {
    format: "CSV",
    description: "A csv file containing 4 columns with the following names: itemId, itemName, owned, needed.",
  },
  {
    format: "Penguin-Stats",
    description: "Penguin-stats format for exporting/importing data",
  },
];
export const SUPPORTED_IMPORT_TYPES: DataShareInfo[] = [
  {
    format: "CSV",
    description:
      "A csv file containing 2 columns with the following names: itemId OR itemName, owned. Header row MUST be present.",
  },
  {
    format: "Penguin-Stats",
    description: "Penguin-stats format for exporting/importing data",
  },
  {
    format: "Depot Recognition",
    description: "Recognize depot materials from images",
  },
];

export interface DataShareInfo {
  format: string;
  description: string;
}

export interface ImportDataResult {
  success: boolean;
  errorMessage: string;
  data: { itemId: string; newQuantity: number }[];
}

type ExportDataStock = { [id: string]: { owned: number; needed: number } };

// Interfaces for PenguinStats json export
interface PenguinData {
  "@type": string;
  items: PenguinItem[];
}

interface PenguinItem {
  id: string;
  have: number;
  need: number;
}

function isPenguinData(o: any): o is PenguinData {
  return "@type" in o;
}

export function exportToString(exportType: string, goals: GoalData[], stock: Record<string, DepotItem>): string {
  const exportData: ExportDataStock = {};

  for (const stockKey in stock) {
    if (stockKey in exportData) {
      exportData[stockKey].owned = stock[stockKey].stock;
    } else {
      exportData[stockKey] = {
        needed: 0,
        owned: stock[stockKey].stock,
      };
    }
  }

  goals
    .flatMap((x) => getPlannerGoals(x))
    .flatMap(getGoalIngredients)
    .forEach((ingredient: Ingredient) => {
      if (ingredient.id in exportData) {
        exportData[ingredient.id].needed = (exportData[ingredient.id].needed ?? 0) + ingredient.quantity;
      } else {
        exportData[ingredient.id] = {
          needed: ingredient.quantity,
          owned: 0,
        };
      }
    });

  switch (exportType) {
    case "CSV":
      return exportToCsv(exportData);
    case "Penguin-Stats":
      return exportToPenguinStats(exportData);
    default:
      //something went very wrong.
      return "Export type not recognized";
  }
}

function exportToCsv(exportData: ExportDataStock): string {
  let dataString = "itemId, itemName, owned, needed\n";
  for (const exportDataKey in exportData) {
    const itemData = itemsJson[exportDataKey as keyof typeof itemsJson] as Item;
    if (itemData) {
      dataString +=
        exportDataKey +
        "," +
        itemData.name +
        "," +
        exportData[exportDataKey].owned +
        "," +
        exportData[exportDataKey].needed +
        "\n";
    }
  }
  return dataString;
}

function exportToPenguinStats(exportData: ExportDataStock): string {
  const data: PenguinData = {
    "@type": "@penguin-statistics/planner/config",
    items: [],
  };

  for (const exportDataKey in exportData) {
    const itemData = itemsJson[exportDataKey as keyof typeof itemsJson] as Item;
    if (itemData) {
      const penguinItem: PenguinItem = {
        id: exportDataKey,
        have: exportData[exportDataKey].owned,
        need: exportData[exportDataKey].needed,
      };
      data.items.push(penguinItem);
    }
  }

  return JSON.stringify(data);
}

export async function importFromString(importType: string, data: string, fileList: File[]): Promise<ImportDataResult> {
  switch (importType) {
    case "CSV":
      return importFromCsv(data);
    case "Penguin-Stats":
      return importFromPenguinStats(data);
    case "Depot Recognition":
      return importFromImage(fileList);
    default:
      //something went very wrong.
      return {
        success: false,
        errorMessage: "Unknown import format",
        data: [],
      };
  }
}

function importFromCsv(data: string): ImportDataResult {
  try {
    const rows = data.split("\n");
    const headers = rows[0].split(",");
    if (headers.length != 2) {
      return {
        success: false,
        errorMessage: "Number of columns is incorrect",
        data: [],
      };
    } else {
      //itemId OR itemName, owned
      const payloadArray: { itemId: string; newQuantity: number }[] = [];

      switch (headers[0]) {
        case "itemId":
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i].split(",");
            const itemData = itemsJson[row[0] as keyof typeof itemsJson] as Item;
            if (itemData) {
              payloadArray.push({ itemId: row[0], newQuantity: parseInt(row[1]) });
            }
          }
          break;
        case "itemName":
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i].split(",");
            const itemName = row[0];
            // @ts-ignore next line gives an error without ts-ignore, but actually works, so we suppress it
            const itemId: string = itemNameToIdJson[itemName];
            if (itemId) {
              payloadArray.push({ itemId: itemId, newQuantity: parseInt(row[1]) });
            }
          }
          break;
        default:
          return {
            success: false,
            errorMessage: "First column has incorrect name",
            data: [],
          };
      }

      return {
        success: true,
        errorMessage: "",
        data: payloadArray,
      };
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: "Failed to parse csv",
      data: [],
    };
  }
}

function importFromPenguinStats(data: string): ImportDataResult {
  try {
    const penguinData = JSON.parse(data);
    const payloadArray: { itemId: string; newQuantity: number }[] = [];
    if (isPenguinData(penguinData)) {
      penguinData.items.forEach((item) => {
        const itemData = itemsJson[item.id as keyof typeof itemsJson] as Item;
        if (itemData) {
          payloadArray.push({ itemId: item.id, newQuantity: item.have });
        }
      });

      return {
        success: true,
        errorMessage: "",
        data: payloadArray,
      };
    } else {
      return {
        success: false,
        errorMessage: "Failed to parse JSON",
        data: [],
      };
    }
  } catch (e) {
    return {
      success: false,
      errorMessage: "Failed to parse JSON",
      data: [],
    };
  }
}

async function importFromImage(fileList: File[]): Promise<ImportDataResult> {
  try {
    const worker = new Worker(new URL("./getMaterialFromImage.ts", import.meta.url), {
      name: "depotRecognition",
    });
    const workerAPI = wrap<MaterialWorker>(worker);

    const result = await workerAPI.getMaterialsFromImage(fileList);
    const payloadArray: { itemId: string; newQuantity: number }[] = [];

    for (let i = 0; i < result.length; i++) {
      const imageResult = result[i];
      for (const itemId in imageResult) {
        if (imageResult[itemId] != null) {
          const existingIndex = payloadArray.findIndex(({ itemId: _itemId }) => _itemId === itemId);
          if (existingIndex === -1) payloadArray.push({ itemId, newQuantity: imageResult[itemId] as number });
          else if (imageResult[itemId] > payloadArray[existingIndex].newQuantity)
            payloadArray[existingIndex] = { itemId, newQuantity: imageResult[itemId] };
        }
      }
    }

    return {
      success: true,
      errorMessage: "",
      data: payloadArray,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      errorMessage: "Depot import failed",
      data: [],
    };
  }
}
