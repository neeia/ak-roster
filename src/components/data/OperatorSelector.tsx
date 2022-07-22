import React, { useEffect } from "react";
import { defaultOperatorObject, Operator } from '../../types/operator';
import { classList } from "../../util/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import operatorJson from "../../data/operators.json";
import useLocalStorage from '../../util/useLocalStorage';
import changeOperator from '../../util/changeOperator';

interface Props {
  onClick: (opId: string) => void;
  filter?: (op: any) => boolean;
  toggleGroup?: string[];
  postSort?: (opA: any, opB: any) => number;
}

const OperatorSelector = React.memo((props: Props) => {
  const { onClick, filter, postSort } = props;

  const [operators, _] = useLocalStorage<Record<string, Operator>>(
    "operators", Object.fromEntries(Object.entries(operatorJson).map(defaultOperatorObject))
  );
  // Iterate through opJson and add any missing to operators
  Object.entries(operatorJson).forEach((op) => {
    if (!(op[0] in operators)) {
      operators[op[0]] = defaultOperatorObject(op)[1];
    }
  })
  const ps = postSort ?? (() => 0)

  function sortComparator(a: any, b: any) {
    return ps(a, b) ||
      b.rarity - a.rarity ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
  }

  // Operator Selector Component
  return (
    <Box component="ul" sx={{
      display: "contents"
    }}>
      {Object.values(operators)
        .filter(filter ?? (() => true))
        .sort(sortComparator)
        .map((op: Operator) => {
          return <Box
            component="li"
            sx={{ listStyleType: "none", display: "contents" }}
            key={op.id}
          >
            <OperatorButton op={op} onClick={onClick} />
          </Box>
        })
      }
    </Box>)
});
export default OperatorSelector;
