import React from "react";
import { Operator, OpJsonObj } from '../../types/operator';
import classList from "../../data/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import operatorJson from "../../data/operators.json";
import useOperators from "../../util/useOperators";

interface Props {
  onClick: (opId: string) => void;
  filter?: (op: OpJsonObj) => boolean;
  sort?: (opA: Operator, opB: Operator) => number;
  toggleGroup?: string[];
}

const OperatorSelector = React.memo((props: Props) => {
  const { onClick, filter, sort } = props;

  const [operators, onChange, applyBatch] = useOperators();
  const defineFilter = filter ?? (() => true);

  const ps = sort ?? (() => 0)
  function sortComparator(a: OpJsonObj, b: OpJsonObj) {
    return ps(operators[a.id], operators[b.id]) ||
      b.rarity - a.rarity ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
  }

  // Operator Selector Component
  return (
    <Box component="ol" sx={{
      display: "contents",
    }}>
      {Object.values(operatorJson)
        .sort(sortComparator)
        .map((op: OpJsonObj) => {
          return <OperatorButton key={op.id} op={operators[op.id]} onClick={onClick} hidden={!defineFilter(op)} />
        })
      }
    </Box>)
});
export default OperatorSelector;
