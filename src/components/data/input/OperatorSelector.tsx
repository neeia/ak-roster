import React from "react";
import { OpInfo, Operator, OperatorData } from 'types/operator';
import classList from "data/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import operatorJson from "data/operators";
import Roster from "types/operators/roster";

interface Props {
  operators: Roster;
  onClick: (opId: string) => void;
  filter?: (opInfo: OperatorData, op: Operator) => boolean;
  sort?: (opA: OpInfo, opB: OpInfo) => number;
}

function nullOperator(id: string): Operator {
  return {
    op_id: id,
    favorite: false,
    potential: 0,
    elite: -1,
    level: 0,
    skill_level: 0,
    masteries: [],
    modules: {}
  };
}


const OperatorSelector = React.memo((props: Props) => {
  const { operators, onClick, filter, sort } = props;

  const defineFilter = filter ?? (() => true);

  const ps = sort ?? (() => 0)
  function sortComparator(a: OpInfo, b: OpInfo) {
    return ps(a, b) ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
  }

  // Operator Selector Component
  return (
    <Box component="ol" sx={{
      display: "contents",
    }}>
      {Object.values(operatorJson)
        .map((op) => ({ ...op, ...(operators[op.id] ?? nullOperator(op.id)) }))
        .sort(sortComparator)
        .map((op) => <OperatorButton key={op.id}
          op={op}
          onClick={onClick}
          hidden={!defineFilter(operatorJson[op.op_id as keyof typeof operatorJson], op)}
        />
        )}
    </Box>)
});
OperatorSelector.displayName = "OperatorSelector"
export default OperatorSelector;
