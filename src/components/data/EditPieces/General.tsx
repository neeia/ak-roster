import React from "react";
import { Operator } from "../../../types/operator";
import { Box, Button } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

interface Props {
  op: Operator;
  onChange: (
    operatorId: string,
    property: string,
    value: number | boolean
  ) => void;
}
const General = ((props: Props) => {
  const { op, onChange } = props;
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      gap: "4px",
    }}>
      <Button
        sx={{
          lineHeight: 1.25,
          border: op.owned ? "" : "",
        }}
        onClick={() => onChange(op.id, "owned", !op.owned)}
      >
        Own
      </Button>
      <Button
        sx={{
          lineHeight: 1.25,
          border: op.favorite ? "" : ""
        }}
        onClick={() => onChange(op.id, "favorite", !op.favorite)}
        disabled={!op.owned}
      >
        {op.favorite
          ? <Favorite fontSize="small" color="info" sx={{ m: "2px" }} />
          : <FavoriteBorder fontSize="small" color="info" sx={{ m: "2px" }} />}
      </Button>
    </Box>
  )
})
export default General;