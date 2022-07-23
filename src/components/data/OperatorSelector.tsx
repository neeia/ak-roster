import React, { useEffect } from "react";
import { defaultOperatorObject, Operator, OpJsonObj } from '../../types/operator';
import classList from "../../data/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import operatorJson from "../../data/operators.json";
import useOperators from "../../util/useOperators";

interface Props {
  onClick: (opId: string) => void;
  filter?: (op: any) => boolean;  
  toggleGroup?: string[];
  postSort?: (opA: Operator, opB: Operator) => number;
}

const OperatorSelector = React.memo((props: Props) => {
  const { onClick, filter, postSort } = props;

  const [operators, onChange, applyBatch] = useOperators();

  const ps = postSort ?? (() => 0)
  function sortComparator(a: OpJsonObj, b: OpJsonObj) {
    return ps(operators[a.id], operators[b.id]) ||
      b.rarity - a.rarity ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
  }

  // Operator Selector Component
  return (
    <Box component="ul" sx={{
      display: "contents",
    }}>
      {Object.values(operatorJson)
        .filter(filter ?? (() => true))
        .sort(sortComparator)
        .map((op: OpJsonObj) => {
          return <Box
            component="li"
            sx={{ listStyleType: "none", display: "contents" }}
            key={op.id}
          >
            <OperatorButton op={operators[op.id]} onClick={onClick} />
          </Box>
        })
      }
    </Box>)
});
export default OperatorSelector;
