import operatorJson from "data/operators";

export default function getNumSkills(op_id: string) {
  const op = operatorJson[op_id];
  return op?.skillData?.length ?? 0;
}
