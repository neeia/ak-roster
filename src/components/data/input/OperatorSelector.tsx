import React from "react";
import { OpInfo, Operator } from "types/operator";
import classList from "data/classList";
import { Box } from "@mui/material";
import OperatorButton from "./OperatorButton";
import operatorJson from "data/operators";
import Roster from "types/operators/roster";
import { useRosterGetQuery } from "store/extendRoster";

interface Props {
  onClick: (opId: string) => void;
  filter: (opInfo: OpInfo) => boolean;
  sort: (opA: OpInfo, opB: OpInfo) => number;
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
    modules: {},
    skin: null,
  };
}

const OperatorSelector = React.memo((props: Props) => {
  const { onClick, filter, sort } = props;

  const { data: operators } = useRosterGetQuery();

  function sortComparator(a: OpInfo, b: OpInfo) {
    return (
      sort(a, b) ||
      classList.indexOf(a.class) - classList.indexOf(b.class) ||
      a.name.localeCompare(b.name)
    );
  }

  // Operator Selector Component
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
          ...(operators?.[op.id] ?? nullOperator(op.id)),
        }))
        .sort(sortComparator)
        .map((op) => (
          <OperatorButton
            key={op.id}
            op_id={op.id}
            className={[
              !op.potential && "unowned",
              !filter(op) && "hidden",
              op.favorite && "favorite",
            ]
              .filter((t) => t)
              .join(" ")}
            onClick={onClick}
          />
        ))}
    </Box>
  );
});
OperatorSelector.displayName = "OperatorSelector";
export default OperatorSelector;
