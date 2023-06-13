import React from "react";
import { OpInfo, Operator, OperatorData, OperatorId } from 'types/operator';
import classList from "data/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import { defaultOperatorObject } from "util/changeOperator";
import operatorJson from "data/operators";
import { useRosterGetQuery } from "store/extendRoster";
import Roster from "types/operators/roster";

interface Props {
  operators: Roster;
  onClick: (opId: OperatorId) => void;
  filter?: (opInfo: OperatorData, op: Operator) => boolean;
  sort?: (opA: OpInfo, opB: OpInfo) => number;
  toggleGroup?: string[];
}

const OperatorSelector = React.memo((props: Props) => {
  const { operators, onClick, filter, sort, toggleGroup } = props;

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
        .map((op) => ({ ...op, ...(operators[op.id] ?? defaultOperatorObject(op.id)) }))
        .sort(sortComparator)
        .map((op) => <OperatorButton
          key={op.id}
          op={op}
          onClick={onClick}
          hidden={!defineFilter(operatorJson[op.op_id as keyof typeof operatorJson], op)}
          toggled={toggleGroup ? toggleGroup.includes(op.op_id) : undefined}
        />
        )}
    </Box>)
});
OperatorSelector.displayName = "OperatorSelector"
export default OperatorSelector;
