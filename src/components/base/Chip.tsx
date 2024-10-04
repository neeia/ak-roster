import { Chip as MuiChip, ChipProps } from "@mui/material";
import React from "react";

interface Props extends Omit<ChipProps, "label" | "children"> {
  children?: React.ReactNode;
}
const Chip = (props: Props) => {
  const { children, ...rest } = props;

  return <MuiChip label={children} {...rest} />;
};
export default Chip;
