import React from "react";
import { Operator, OperatorData, OperatorId } from 'types/operator';
import classList from "data/classList";
import { Box } from "@mui/material";
import OperatorBlock from "./OperatorBlock";
import EditWrapper from "./EditWrapper";
import operatorJson from "data/operators";
import { OpInfo, SortFunction } from "types/sort";
import { defaultOperatorObject } from "util/changeOperator";
import { useAppSelector } from "store/hooks";
import { selectRoster } from "store/rosterSlice";

interface Props {
  filter?: (opInfo: OperatorData, op: Operator) => boolean;
  sort?: SortFunction;
  editMode?: boolean;
  onClick?: (opId: OperatorId) => void;
}

const CollectionContainer = (props: Props) => {
  const { filter, sort, editMode, onClick } = props;
  const operators = useAppSelector(selectRoster);

  const defineFilter = filter ?? (() => true);

  const defineSort = sort ?? (() => 0)
  function sortComparator(a: OpInfo, b: OpInfo) {
    return defineSort(a, b) ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
  }

  // Operator Selector Component
  return (
    <Box component="ol" display="contents">
      {Object.values(operatorJson)
        .map((op) => ({ ...op, ...(operators[op.id] ?? defaultOperatorObject(op.id)) }))
        .sort(sortComparator)
        .map((op: Operator) => {
          return <Box component="li" key={op.op_id}
            sx={{
              listStyleType: "none",
              display: !defineFilter(operatorJson[op.op_id], op) ? "none" : ""
            }}
          >
            <EditWrapper editMode={editMode} onClick={() => onClick && onClick(op.op_id)}>
              <OperatorBlock op={op} />
            </EditWrapper>
          </Box>
        })
      }
    </Box>)
}
export default CollectionContainer;
