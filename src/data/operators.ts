import { OperatorData } from "types/operators/operator";
import json from "./operators.json";

/*
  This file serves as a wrapper for operators.json
  It mainly exists to provide typing and to make importing easier
*/
const operatorJson = json as Record<string, OperatorData>;
export default operatorJson;
