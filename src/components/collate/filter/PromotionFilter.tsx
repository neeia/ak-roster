import { Box, Divider, IconButton } from "@mui/material";
import React from "react";

const br = (index: number) => {
  const r = 4;
  if (index === 0) return `${r}px 0px 0px ${r}px`;
  else if (index === 2) return `0px ${r}px ${r}px 0px`;
  else return "0";
}

interface Props {
  activePromotions: number[];
  toggleFilter: (value: number) => void;
}
const PromotionFilter = (props: Props) => {
  const { activePromotions, toggleFilter } = props;

  return (
    <Box sx={{ width: "100%" }}>
      <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
        Elite
      </Divider>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", width: "100%" }}>
        {[...Array(3)].map((_, i) => (
          <IconButton
            key={i}
            className={activePromotions.includes(i) ? "active" : "inactive"}
            sx={{ borderRadius: br(i) }}
            onClick={() => toggleFilter(i)}
          >
            <Box
              component="img"
              width="2rem"
              src={`/img/elite/${i}.png`}
              alt={`Elite ${i}`}
            />
          </IconButton>
        ))}
      </Box>
    </Box>);
}

export default PromotionFilter;