export interface Item {
  id: string;
  name: string;
  tier: number;
  sortId: number;
  iconId: string;
  yield?: number;
  ingredients?: Ingredient[];
  stages?: {
    leastSanity?: StageData;
    mostEfficient?: StageData;
  };
}

export interface Ingredient {
  id: string;
  quantity: number;
}

export interface StageData {
  stageSanityCost: number;
  stageName: string;
  itemSanityCost: number;
  dropRate: number;
}