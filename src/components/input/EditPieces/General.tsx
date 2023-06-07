import React from "react";
import { Operator } from "types/operator";
import { Box, Button } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { changeFavorite, changeOwned } from "util/changeOperator";
import { addOperator, deleteOperator } from "store/rosterSlice";
import { useAppDispatch } from "store/hooks";

interface Props {
  op: Operator;
  onChange: (newOperator: Operator) => void;
}
const General = ((props: Props) => {
  const { op, onChange } = props;
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
        onClick={() => op.potential ? dispatch(deleteOperator(op.op_id)) : dispatch(addOperator(op.op_id))}
      >
        Own
      </Button>
      <Button
        className={op.favorite ? "active" : "inactive"}
        onClick={() => onChange(changeFavorite(op, !op.favorite))}
        disabled={!op.potential}
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