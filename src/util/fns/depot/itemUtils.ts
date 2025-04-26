import itemsJson from 'data/items.json';
import { Item } from 'types/item';

export const EXP = ["2001", "2002", "2003", "2004"];

export const MAX_SAFE_INTEGER = 2147483647;

export const AK_CALENDAR = {
    1: { "4001": 2000 },
    8: { "4001": 4000 },
    15: { "4001": 6000 },
    22: { "4001": 8000 },
    29: { "4001": 10000 },
    2: { "2001": 10 },
    9: { "2002": 10 },
    16: { "2003": 6 },
    23: { "2004": 4 },
    30: { "2004": 5 },
    4: { "4006": 8 },
    18: { "4006": 25 },
    6: { "3301": 5 },
    13: { "3301": 10 },
    20: { "3302": 5 },
    27: { "3303": 6 },
    28: { "32001": 1 }
};

export const AK_DAILY = {
    "4001": 9500,
    "4006": 5,
    "2001": 8,
    "2002": 5,
    "2003": 6,
}

export const AK_WEEKLY = {
    "4001": 23000,
    "3301": 5,
    "2001": 4,
    "2002": 4,
    "2003": 4,
    "2004": 9,
    "4006": 30,
    "mod_unlock_token": 1
}

export const getItemBaseStyling = (variant: "tracker"
    | "summary" | "summary_craft" | "summary_totals"
    | "builder" | "selector" | "submit"
    | number, smaller: boolean = false) => {

    let size: number;
    let textAdjust = 12;

    switch (variant) {
        case "tracker": {
            size = 34;
            textAdjust = 8;
        };
            break;
        case "submit": {
            size = 28;
        };
            break;
        case "builder": {
            size = !smaller ? 40 : 32;
        }
            break;
        case "selector": {
            size = !smaller ? 32 : 28;
            textAdjust = 10;
        }
            break;
        case "summary_craft": {
            size = (!smaller ? 56 : 48) * 0.75;
        }
            break;
        case "summary_totals": {
            size = (!smaller ? 56 : 56) * 0.6;
            textAdjust = 10;
        }
            break;
        default: {
            size = !smaller ? 56 : 48;
        };
            break;
    }

    return ({
        itemBaseSize: size,
        numberCSS: {
            component: "span",
            sx: {
                display: "inline-block",
                py: 0.25,
                px: 0.5,
                lineHeight: 1,
                mr: `${size / 16}px`,
                mb: `${size / 16}px`,
                alignSelf: "end",
                justifySelf: "end",
                backgroundColor: "background.paper",
                zIndex: 1,
                fontSize: `${size / 24 + textAdjust}px`,
            },
        }
    })
};

export const getFarmCSS = (variant: "round" | "box", highlighted: boolean = true) => {
    const color = highlighted ? "primary.main" : undefined;
    let radius = variant === "round" ? "20px" : "6px";

    return ({
        backgroundColor: color,
        borderRadius: radius,
    })

};

export const isMaterial = (id: string, tier?: number, tierNot?: number) => {
    return (Number(id) > 30000 && Number(id) < 32000
        && (tier ? (itemsJson[id as keyof typeof itemsJson].tier === tier) : true)
        && (tierNot ? (itemsJson[id as keyof typeof itemsJson].tier !== tierNot) : true))
};

const summarySortId: [string, number][] = [
    ["LMD", -3],
    ["EXP", -2],
    ["Certificate", -1],
    //all mats= 0
    ["Summary", 1],
    ["Catalyst", 3],
    ["chip", 2],
    ["Chip", 2],
    ["Data", 4],
    ["Record", 5],
];

export const farmItemsSort = (idA: string, idB: string) => {
    const customSortId = summarySortId;

    const itemA = itemsJson[idA as keyof typeof itemsJson];
    const itemB = itemsJson[idB as keyof typeof itemsJson];
    const itemAlocalSortID = customSortId.find(keyword => itemA.name.includes(keyword[0]))?.[1] ?? 0;
    const itemBlocalSortID = customSortId.find(keyword => itemB.name.includes(keyword[0]))?.[1] ?? 0;
    return (
        (itemAlocalSortID - itemBlocalSortID)
    );
};

export const standardItemsSort = (idA: string, idB: string, reverse: boolean = false) => {
    const sortIdA = itemsJson[idA as keyof typeof itemsJson].sortId;
    const sortIdB = itemsJson[idB as keyof typeof itemsJson].sortId;
    return (!reverse
        ? sortIdA - sortIdB
        : sortIdB - sortIdA)
};

export const customItemsSort = (idA: string, idB: string, lowTierFirst: boolean = false, variant?: string) => {
    const itemA = itemsJson[idA as keyof typeof itemsJson];
    const itemB = itemsJson[idB as keyof typeof itemsJson];
    return (
        (farmItemsSort(idA, idB)) ||
        (!lowTierFirst ? (itemB.tier - itemA.tier) : (itemA.tier - itemB.tier)) ||
        (standardItemsSort(idA, idB, true))
    )
};

export const formatNumber = (num: number) => {
    return num < 1000
        ? num
        : num < 1000000
            ? `${num % 1000 === 0 ? `${num / 1000}` : (num / 1000).toFixed(1)}K`
            : `${num % 1000000 === 0 ? `${num / 1000000}` : (num / 1000000).toFixed(2)}M`;
};

export const getWidthFromValue = (value: string | number, defaultSizeInCh: string = "4ch"): string => {

    let numberDigits: number;
    let effectiveLengh = 0;

    if (!isNaN(Number(value))) {
        const numValue = Math.abs(Number(value));
        numberDigits = numValue === 0 ? 1 : Math.floor(Math.log10(numValue)) + 1;
        effectiveLengh = numberDigits;
    } else {
        const strValue = String(value).trim();
        if (!strValue) return defaultSizeInCh;

        for (const char of strValue) {
            effectiveLengh += char === char.toUpperCase() && char !== char.toLowerCase()
                ? 1.15
                : /\d/.test(char)
                    ? 1
                    : /[,.]/.test(char)
                        ? 0
                        : 0.85
        }
    }

    let startSize: number = 2.5;
    if (defaultSizeInCh.includes('ch'))
        startSize = Number(defaultSizeInCh.replace('ch', '').trim());

    if (startSize - effectiveLengh > 0) return defaultSizeInCh;
    else return `${2 + (effectiveLengh - 1)}ch`; // Start at 2.5ch for 1 char
};

export const getDefaultEventMaterials = (itemJson: Record<string, Item> = itemsJson): string[] => {
    return Object.keys(itemJson)
        .map((id) => itemJson[id as keyof typeof itemJson])
        .filter((item) =>
            ["EXP", "Dualchip"].every((keyword) => !item.name.includes(keyword)))
        .map((item) => item.id)
        .sort((idA, idB) => standardItemsSort(idA, idB));
};

export const getItemByCnName = (cnName: string, tier?: number, material: boolean = false, itemJson: Record<string, Item> = itemsJson): Item | undefined => {
    const matchedItem = Object.values(itemJson).find(
        (item) => {
            if (!(`cnName` in item)) return false;

            const isCnNameMatch = item.cnName === cnName;
            let matTierMatch = material ? isMaterial(item.id, tier) : true;
            return isCnNameMatch && matTierMatch;
        }
    ) as Item | undefined;
    return matchedItem;
}

export const getItemsByIngredient = (ingr_id: string, result?: string[]) => {

    const results = new Set(result);
    results.add(ingr_id);

    const findParents = (id: string) => {
        const targetItem: Item = itemsJson[id as keyof typeof itemsJson];
        if ((targetItem.tier ?? 5) >= 5) return;

        Object.values(itemsJson).forEach((item: Item) => {
            if (item.ingredients?.some(ingr => ingr.id === id)) {
                if (!results.has(item.id)) {
                    results.add(item.id);
                }
                findParents(item.id);
            }
        });
    };

    findParents(ingr_id);

    return Array.from(results);
};