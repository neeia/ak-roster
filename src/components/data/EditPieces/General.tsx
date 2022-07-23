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
      "& > *": {
        lineHeight: 0.5,
      }
    }}>
      <Button
        className={op.owned ? "active" : ""}
        onClick={() => onChange(op.id, "owned", !op.owned)}
      >
        Own
      </Button>
      <Button
        className={op.favorite ? "active" : "inactive"}
        onClick={() => onChange(op.id, "favorite", !op.favorite)}
        disabled={!op.owned}
      >
        {op.favorite
          ? <Favorite fontSize="small" color="error" sx={{ m: "2px" }} />
          : <FavoriteBorder fontSize="small" color="error" sx={{ m: "2px" }} />}
      </Button>
    </Box>
  )
})
export default General;