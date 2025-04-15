import { Box, Button, lighten, TextField } from "@mui/material";
import React, { useState } from "react";
import { debounce } from "lodash";
import { AccountMutateProps } from "pages/data/profile";
import getContrastText from "util/fns/getContrastText";

const Color = (props: AccountMutateProps) => {
  const { user, setAccount } = props;

  const [color, setColor] = useState<string>(user.color ?? "#000000");
  const setColorDebounced = debounce((color) => setColor(color), 100);

  const changeColor = () => {
    if (color !== user.color)
      setAccount({
        color,
      });
  };
  const removeColor = () => {
    setAccount({
      color: null,
    });
  };

  return (
    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <TextField
        id="Color"
        label="Profile Color"
        type="color"
        variant="filled"
        value={color}
        onChange={(e) => {
          setColorDebounced(e.target.value);
        }}
        sx={{ colorScheme: (theme) => theme.palette.mode }}
        InputLabelProps={{ shrink: true }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, width: "100%" }}>
        <Button onClick={removeColor}>Remove Color</Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={() => setColor(user.color ?? "")}>Reset</Button>
          <Button
            type="submit"
            sx={{
              color: getContrastText(color),
              backgroundColor: color,
              "&:hover": {
                backgroundColor: lighten(color, 0.1),
              },
            }}
            disabled={color === user.color}
            onClick={(e) => {
              e.preventDefault();
              changeColor();
            }}
          >
            Save Color
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Color;
