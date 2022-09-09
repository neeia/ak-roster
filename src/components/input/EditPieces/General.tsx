import React from "react";
import { Operator } from "../../../types/operator";
import { Box, Button } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { changeFavorite, changeOwned } from "../../../util/changeOperator";

interface Props {
  op: Operator;
  onChange: (operatorID: string, newOperator: Operator) => void;
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
        onClick={() => onChange(op.id, changeOwned(op, !op.owned))}
      >
        Own
      </Button>
      <Button
        className={op.favorite ? "active" : "inactive"}
        onClick={() => onChange(op.id, changeFavorite(op, !op.favorite))}
      >
        {op.favorite
          ? <Favorite fontSize="small" color="error" sx={{ m: "2px" }} />
          : <FavoriteBorder fontSize="small" color="error" sx={{ m: "2px" }} />}
      </Button>
    </Box>
  )
})
export default General;