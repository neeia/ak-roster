import React from "react";
import { Operator } from "../../../types/operator";
import { Box, Button, IconButton } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { MAX_PROMOTION_BY_RARITY } from "../../../util/changeOperator";

interface Props {
  op: Operator;
  onChange: (
    operatorId: string,
    property: string,
    value: number | boolean
  ) => void;
}
const Promotion = ((props: Props) => {
  const { op, onChange } = props;
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      gap: "4px",
    }}>
      {[...Array(3)].map((_, i) => {
        const disabled = !op.owned || i < MAX_PROMOTION_BY_RARITY[op.rarity];
        return (
          <IconButton
            sx={{
              border: op.potential === i ? "" : ""
            }}
            onClick={() => onChange(op.id, "promotion", i)}
            disabled={disabled}
            key={`pro${i + 1}`}
          >
            <img
              width="32px"
              src={`/img/elite/${i}.png`}
              alt={`Elite ${i} Button`}
            />
          </IconButton>
        )
      })}
    </Box>
  )
})
export default Promotion;