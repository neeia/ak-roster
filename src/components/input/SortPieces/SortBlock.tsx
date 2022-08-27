import React from "react";
import { Box, Button, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import { Favorite } from "@mui/icons-material";

const WIDTH_TO_PX = 10 / 7;
const LONG_CUTOFF = 75;
const LONGER_CUTOFF = 95;

interface Props {
  value: string;
  values: string[];
  handleChange: (value: string) => void;
}

const SortBlock = ((props: Props) => {
  const { value, values, handleChange } = props;

  return (
    <>
      <Select onChange={e => handleChange(e.target.value as string)} value={value}>
        {values.map((v: string) =>
          <MenuItem key={v} value={v}>{v}</MenuItem>
        )}
      </Select>
    </>
  )
});

export default SortBlock;