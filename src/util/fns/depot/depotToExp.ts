import DepotItem from "types/depotItem";

export const BATTLE_RECORD_TO_EXP: Record<string, number> = {
  "2001": 200,
  "2002": 400,
  "2003": 1000,
  "2004": 2000,
};

const depotToExp = (depot: Record<string, DepotItem>): number => {
  return Object.entries(BATTLE_RECORD_TO_EXP).reduce(
    (acc, [id, value]) => acc + (depot[id]?.stock ?? 0) * value,
    0
  )
}
export default depotToExp;