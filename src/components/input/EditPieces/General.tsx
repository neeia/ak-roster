import React from "react";
import { Operator } from "types/operator";
import { Box, Button } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { changeFavorite, changeOwned } from "util/changeOperator";
import { addOperator, deleteOperator } from "store/rosterSlice";
import { useAppDispatch } from "store/hooks";

interface Props {
  op: Operator;
}
const General = ((props: Props) => {
  const { op } = props;
  const dispatch = useAppDispatch();
  
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
        className={op.potential ? "active" : ""}
        onClick={() => op.potential ? dispatch(deleteOperator([op.id])) : dispatch(addOperator([op.id]))}
      >
        Own
      </Button>
      <Button
        className={op.favorite ? "active" : "inactive"}
        onClick={() => onChange(changeFavorite(op, !op.favorite))}
        aria-label="favorite"
      >
        {op.favorite
          ? <Favorite fontSize="small" color="error" sx={{ m: "2px" }} />
          : <FavoriteBorder fontSize="small" color="error" sx={{ m: "2px" }} />}
      </Button>
    </Box>
  )
})
export default General;