import React from "react";
import { OpInfo } from "types/operators/operator";
import classList from "data/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import operatorJson from "data/operators";
import Roster from "types/operators/roster";
import { defaultOperatorObject } from "util/changeOperator";
import clsx from "clsx";
import getAvatar from "util/fns/getAvatar";

interface Props {
  roster: Roster;
  onClick: (opId: string) => void;
  filter: (opInfo: OpInfo) => boolean;
  sort: (opA: OpInfo, opB: OpInfo) => number;
}

const OperatorSelector = React.memo((props: Props) => {
  const { roster, onClick, filter, sort } = props;

  function sortComparator(a: OpInfo, b: OpInfo) {
    return sort(a, b) || classList.indexOf(a.class) - classList.indexOf(b.class) || a.name.localeCompare(b.name);
  }

  return (
    <Box
      component="ol"
      sx={{
        display: "contents",
        "& .icon-fav": {
          display: "none",
        },
        "& .favorite .icon-fav": {
          display: "block",
          position: "absolute",
          top: 2,
          left: 2,
        },
      }}
    >
      {Object.values(operatorJson)
        .map((op) => ({
          ...op,
          ...(roster?.[op.id] ?? defaultOperatorObject(op.id)),
        }))
        .sort(sortComparator)
        .map((op) => (
          <Box key={op.id} component="li" sx={{ display: "contents" }}>
            <OperatorButton
              op_id={op.id}
              className={clsx({
                unowned: !op.potential,
                hidden: !filter(op),
                favorite: op.favorite,
              })}
              skin={getAvatar(op)}
              onClick={onClick}
            />
          </Box>
        ))}
    </Box>
  );
});
OperatorSelector.displayName = "OperatorSelector";
export default OperatorSelector;
