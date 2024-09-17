import { Box, BoxProps, Button, Typography } from "@mui/material";
import React from "react";

interface Props extends Omit<BoxProps, "onClick"> {
  title?: string,
  label?: string;
  onClick?: () => void;
}

const SelectGroup = (props: Props) => {
  const { title, label, children, onClick, sx, ...rest } = props;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        ...sx
      }}
      {...rest}
    >
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Typography variant="h3">
          {title}
        </Typography>
        {label &&
          <Button variant="text" onClick={onClick} sx={{
            color: "text.secondary",
            p: 0, 
          }}>
            {label}
          </Button>
        }
      </Box>
      {children}
    </Box>
  );
};

export default SelectGroup;