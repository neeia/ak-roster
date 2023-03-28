import React from "react";
import { Operator, OperatorData } from 'types/operator';
import classList from "data/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import operatorJson from "data/operators.json";

interface Props {
  operators: Record<string, Operator>;
  onClick: (opId: string) => void;
  filter?: (opInfo: OperatorData, op: Operator) => boolean;
  sort?: (opA: Operator, opB: Operator) => number;
  toggleGroup?: string[];
}

const OperatorSelector = React.memo((props: Props) => {
  const { operators, onClick, filter, sort, toggleGroup } = props;

  const defineFilter = filter ?? (() => true);

  const ps = sort ?? (() => 0)
  function sortComparator(a: Operator, b: Operator) {
    const opDataA = operatorJson[a.id as keyof typeof operatorJson];
    const opDataB = operatorJson[b.id as keyof typeof operatorJson];
    return ps(a, b) ||
      classList.indexOf(opDataA.class) - classList.indexOf(opDataB.class) ||
      opDataA.name.localeCompare(opDataB.name)
  }

  // Operator Selector Component
  return (
    <Box component="ol" sx={{
      display: "contents",
    }}>
      {Object.values(operators)
        .sort(sortComparator)
        .map((op: Operator) => <OperatorButton
          key={op.id}
          op={op}
          onClick={onClick}
          hidden={!defineFilter(operatorJson[op.id as keyof typeof operatorJson], op)}
          toggled={toggleGroup ? toggleGroup.includes(op.id) : undefined}
        />
        )}
    </Box>)
});
OperatorSelector.displayName = "OperatorSelector"
export default OperatorSelector;
