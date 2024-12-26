import React from "react";
import Box, { BoxProps } from "@mui/material/Box";

interface Props extends BoxProps {
  icon?: React.ReactNode;
  version: string;
  title: string;
  description: React.ReactNode;
}

const Update = (props: Props) => {
  const { icon, version, title, description, sx, ...rest } = props;

  return <Box component="li" display="flex"></Box>;
};
export default Update;
