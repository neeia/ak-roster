import { Star } from "@mui/icons-material";
import { Box, Divider, IconButton } from "@mui/material";
import React, { useState } from "react";
import { rarityColors } from "styles/rarityColors";
import { FilterFunction } from "types/filter";
import { Operator } from "types/operator";
import { Value } from "util/useFilter";

const br = (index: number) => {
  const r = 4;
  if (index === 0) return `${r}px 0px 0px ${r}px`;
  else if (index === 5) return `0px ${r}px ${r}px 0px`;
  else return "0";
};
const bm = (index: number) => {
  const r = 4;
  if (index === 0) return `${r}px 0px 0px 0px`;
  else if (index === 2) return `0px ${r}px 0px 0px`;
  else if (index === 3) return `0px 0px 0px ${r}px`;
  else if (index === 5) return `0px 0px ${r}px 0px`;
  else return "0";
};

interface Props {
  value: Set<Value>;
  onChange: (value: number) => void;
}
const RarityFilter = (props: Props) => {
  const { value: activeRarities, onChange: toggleFilter } = props;

  return (
    <>
      <Divider sx={{ mt: 1, mb: 0.5 }} variant="middle" flexItem>
        Rarity
      </Divider>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(6, 1fr)" },
          width: "100%",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <IconButton
            key={i}
            className={activeRarities.has(i + 1) ? "active" : "inactive"}
            sx={{
              borderRadius: { xs: bm(i), sm: br(i) },
              color: rarityColors[i + 1],
              fontSize: "1rem",
            }}
            onClick={() => toggleFilter(i + 1)}
          >
            {i + 1}
            <Star fontSize="small" />
          </IconButton>
        ))}
      </Box>
    </>
  );
};

export default RarityFilter;
