import React from "react";
import { OpInfo } from "types/operators/operator";
import classList from "data/classList";
import { Box } from "@mui/material";
import OperatorBlock from "../OperatorBlock";
import EditWrapper from "./EditWrapper";
import operatorJson from "data/operators";
import { defaultOperatorObject } from "util/changeOperator";
import { SortFunction } from "types/sort";
import Roster from "types/operators/roster";
import clsx from "clsx";

interface Props {
  roster: Roster;
  onClick?: (opId: string) => void;
  filter: (op: OpInfo) => boolean;
  sort: SortFunction;
  editMode?: boolean;
}

const CollectionContainer = (props: Props) => {
  const { roster, filter, sort, editMode, onClick } = props;

  function sortComparator(a: OpInfo, b: OpInfo) {
    return sort(a, b) || classList.indexOf(a.class) - classList.indexOf(b.class) || a.name.localeCompare(b.name);
  }

  return (
    <Box component="ol" display="contents">
      {Object.values(operatorJson)
        .map((op) => ({
          ...op,
          ...(roster[op.id] ?? defaultOperatorObject(op.id)),
        }))
        .sort(sortComparator)
        .map((op: OpInfo) => {
          return (
            <Box
              component="li"
              key={op.op_id}
              className={clsx({
                hidden: !filter(op),
              })}
              sx={{
                display: "contents",
              }}
            >
              <EditWrapper editMode={editMode} onClick={() => onClick && onClick(op.op_id)}>
                <OperatorBlock
                  op={op}
                  className={clsx({
                    unowned: !op.potential,
                    favorite: op.favorite,
                  })}
                />
              </EditWrapper>
            </Box>
          );
        })}
    </Box>
  );
};
export default CollectionContainer;
