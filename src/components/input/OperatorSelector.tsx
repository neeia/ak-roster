import React from "react";
import { Operator, OpJsonObj } from '../../types/operator';
import classList from "../../data/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import { isUndefined } from "util";
import operatorJson from "../../data/operators.json";

interface Props {
  operators: Record<string, Operator>;
  onClick: (opId: string) => void;
  filter?: (opInfo: OpJsonObj, op: Operator) => boolean;
  sort?: (opA: Operator, opB: Operator) => number;
  toggleGroup?: string[];
}

const OperatorSelector = React.memo((props: Props) => {
  const { operators, onClick, filter, sort, toggleGroup } = props;

  const defineFilter = filter ?? (() => true);

  const ps = sort ?? (() => 0)
  function sortComparator(a: Operator, b: Operator) {
    return ps(a, b) ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
  }

  // Operator Selector Component
  return (
    <Box component="ol" sx={{
      display: "contents",
    }}>
      {Object.values(operators)
        .sort(sortComparator)
        .map((op: Operator) => {
          const className = isUndefined(toggleGroup) ? undefined : toggleGroup.includes(op.id) ? "toggled" : "untoggled"
            + " " + !defineFilter(operatorJson[op.id as keyof typeof operatorJson], op) ? "hidden" : "";
          return <OperatorButton
            key={op.id}
            op={operators[op.id]}
            onClick={onClick}
            className={className}
          />
        })
      }
    </Box>)
});
OperatorSelector.displayName = "OperatorSelector"
export default OperatorSelector;
