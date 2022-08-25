import React from "react";
import { Operator, OpJsonObj } from '../../types/operator';
import classList from "../../data/classList";
import { Box } from "@mui/material";
import operatorJson from "../../data/operators.json";
import useOperators from "../../util/useOperators";
import OperatorBlock from "./OperatorBlock";

interface Props {
  filter?: (op: OpJsonObj) => boolean;
  sort?: (opA: Operator, opB: Operator) => number;
}

const CollectionContainer = React.memo((props: Props) => {
  const { filter, sort } = props;

  const [operators] = useOperators();

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
        .filter((op: OpJsonObj) => filter ? filter(op) : true)
        .sort(sortComparator)
        .map((op: OpJsonObj) => {
          return <Box
            component="li"
            sx={{ listStyleType: "none", display: "contents" }}
            key={op.id}
          >
            <OperatorBlock op={operators[op.id]} />
          </Box>
        })
      }
    </Box>)
});
export default CollectionContainer;
