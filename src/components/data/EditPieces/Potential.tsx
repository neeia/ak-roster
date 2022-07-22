import React from "react";
import { Operator } from "../../../types/operator";
import { Box, Button, IconButton } from "@mui/material";

interface Props {
  op: Operator;
  onChange: (
    operatorId: string,
    property: string,
    value: number | boolean
  ) => void;
}
const Potential = ((props: Props) => {
  const { op, onChange } = props;
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      gap: "4px",
    }}>
      {[...Array(6)].map((_, i) =>
          <IconButton
            sx={{
              border: op.potential === i + 1 ? "" : ""
            }}
          onClick={() => onChange(op.id, "potential", i + 1)}
          disabled={!op.owned}
          key={`pot${i + 1}`}
        >
          <img
            width="32px"
            src={`/img/potential/${i + 1}.png`}
            alt={`Potential ${i + 1} Button`}
          />
        </IconButton>
      )}
    </Box>
  )
})
export default Potential;