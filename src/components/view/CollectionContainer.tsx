import React from "react";
import { Operator, OpJsonObj } from '../../types/operator';
import classList from "../../data/classList";
import { Box } from "@mui/material";
import operatorJson from "../../data/operators.json";
import OperatorBlock from "./OperatorBlock";
import EditWrapper from "./EditWrapper";

interface Props {
  operators: Record<string, Operator>;
  filter?: (opInfo: OpJsonObj, op: Operator) => boolean;
  sort?: (opA: Operator, opB: Operator) => number;
  editMode?: boolean;
  onClick?: (opId: string) => void;
}

const CollectionContainer = (props: Props) => {
  const { operators, filter, sort, editMode, onClick } = props;

  const defineFilter = filter ?? (() => true);

  const defineSort = sort ?? (() => 0)
  function sortComparator(a: Operator, b: Operator) {
    return defineSort(a, b) ||
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
            <EditWrapper editMode={editMode} onClick={() => onClick && onClick(op.id)}>
              <OperatorBlock op={op} />
            </EditWrapper>
          </Box>
        })
      }
    </Box>)
}
export default CollectionContainer;
