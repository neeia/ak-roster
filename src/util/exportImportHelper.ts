import {GoalsState} from "../store/goalsSlice";
import itemsJson from "data/items.json";
import {StockState} from "../store/depotSlice";
import getGoalIngredients from "./getGoalIngredients";
import {Ingredient, Item} from "../types/item";

export const SUPPORTED_EXPORT_IMPORT_TYPES = ["CSV", "Penguin-Stats"]

type ExportDataStock = { [id: string] : { owned: number; needed: number; }}

// Interfaces for PenguinStats json export
interface PenguinData
  {
    "@type" : string;
    items : PenguinItem[];
  }

interface PenguinItem  {
  id : string;
  have: number;
  need: number;
}

export function exportToString(exportType: string, goals: GoalsState, stock: StockState) : string{
  const exportData : ExportDataStock = {};

  for (const stockKey in stock) {
    if (stockKey in exportData)
    {
      exportData[stockKey].owned = stock[stockKey];
    }
    else
    {
      exportData[stockKey] = {
        needed: 0,
        owned : stock[stockKey],
      }
    }

  goals.flatMap(getGoalIngredients).forEach((ingredient: Ingredient) => {
    if (ingredient.id in exportData)
    {
      exportData[ingredient.id].needed = (exportData[ingredient.id].needed ?? 0) + ingredient.quantity;
    }
    else
    {
      exportData[ingredient.id] = {
        needed: ingredient.quantity,
        owned : 0,
      };
    }
  });
  }

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

function exportToCsv(exportData : ExportDataStock) : string{
  let dataString = "itemId, itemName, owned, needed\n";
  for (const exportDataKey in exportData) {
    const itemData = itemsJson[
      exportDataKey as keyof typeof itemsJson
      ] as Item;
    dataString += exportDataKey + "," + itemData.name + "," + exportData[exportDataKey].owned + "," + exportData[exportDataKey].needed + "\n";
  }
  return dataString;
}

function exportToPenguinStats(exportData : ExportDataStock) : string{
  const data : PenguinData = {
    "@type" : "@penguin-statistics/planner/config",
    items : [],
  }

  for (const exportDataKey in exportData) {
    const penguinItem : PenguinItem = {
      id : exportDataKey,
      have : exportData[exportDataKey].owned,
      need : exportData[exportDataKey].needed
    }
    data.items.push(penguinItem);
  }

  return JSON.stringify(data);
}