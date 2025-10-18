import DepotItem from "types/depotItem";
import { BATTLE_RECORD_TO_EXP } from "./depotToExp";

const expIds = ["2004", "2003", "2002", "2001"];

interface BattleRecordConversion {
  success: boolean;
  depot: Record<string, DepotItem>;
}

const expToBattleRecords = (goal: number, depot: Record<string, DepotItem>): BattleRecordConversion => {
  const _depot = structuredClone(depot);

  let exp = goal;

  // use as many battle records as possible (from smallest to greatest) without exceeding the goal
  expIds.forEach((id) => {
    const { stock } = _depot?.[id] ?? {};
    const value = BATTLE_RECORD_TO_EXP[id];
    if (!stock) return;

    const consumed = Math.min(stock, Math.floor(exp / value));

    exp -= consumed * value;
    _depot[id].stock = stock - consumed;
  });

  // add more battle records (from smallest to greatest) until the goal is met
  expIds.toReversed().forEach((id) => {
    if (exp <= 0) return;
    const { stock } = _depot?.[id] ?? {};
    if (!stock) return;

    const value = BATTLE_RECORD_TO_EXP[id];

    exp -= value;
    _depot[id].stock = stock - 1;
  });

  if (exp > 0) return { success: false, depot };
  return { success: true, depot: _depot };
};
export default expToBattleRecords;
