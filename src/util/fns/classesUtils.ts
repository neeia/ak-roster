import classList from "data/classList";
import { Branch } from "types/operators/operator";
import opJson from "data/operators.json";

export function getBranches(className: string): Branch[] {
  const branchCount: Record<string, { id: string; name: string; opCount: number }> = {};
  Object.values(opJson).forEach((op) => {
    if (op.class === className && op.branch) {
      const { id, name } = op.branch;
      if (!branchCount[id]) {
        branchCount[id] = { id, name, opCount: 0 };
      }
      branchCount[id].opCount++;
    }
  });

  return Object.values(branchCount)
    .sort((a, b) => b.opCount - a.opCount)
    .map(({ id, name }) => ({ id, name }));
}

export function getClassByBranch(branchId: string): string {
  for (const key in opJson) {
    const op = opJson[key as keyof typeof opJson];
    if (op.branch && op.branch.id === branchId
      && classList.includes(op.class)) {
      return op.class;
    }
  }
  return "";
}

export function getClasses(branchIds: string[]): Set<string> {
  const classes = new Set<string>();
  branchIds.forEach(bid => {
    const cls = getClassByBranch(bid);
    if (cls) classes.add(cls);
  });
  return classes;
}