import React from "react";
import { Operator, OpJsonObj } from '../../types/operator';
import classList from "../../data/classList";
import { Box } from "@mui/material";
import operatorJson from "../../data/operators.json";
import OperatorBlock from "./OperatorBlock";

interface Props {
  operators: Record<string, Operator>;
  filter?: (opInfo: OpJsonObj, op: Operator) => boolean;
  sort?: (opA: Operator, opB: Operator) => number;
}

const CollectionContainer = (props: Props) => {
  const { operators, filter, sort } = props;

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
          return <Box
            component="li"
            key={op.id}
            sx={{
              listStyleType: "none",
              display: !defineFilter(operatorJson[op.id as keyof typeof operatorJson], op) ? "none" : ""
            }}>
            <OperatorBlock op={op} />
          </Box>
        })
      }
    </Box>)
}
export default CollectionContainer;
