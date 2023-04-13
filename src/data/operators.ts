import { OperatorData, OperatorId } from "types/operator";
import json from "./operators.json";

/*
  This file serves as a wrapper for operators.json
  It mainly exists to provide typing and to make importing easier
*/
const operatorJson = json as Record<OperatorId, OperatorData>;
export default operatorJson;