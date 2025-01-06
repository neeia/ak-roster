import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, InputAdornment, OutlinedTextFieldProps, TextField } from "@mui/material";
import React, { useState } from "react";

// hacky but you can't extend TextFieldProps for some reason
interface Props extends Omit<OutlinedTextFieldProps, "variant"> {
  value: string;
  variant?: "standard" | "filled" | "outlined";
}

const PasswordTextField = (props: Props) => {
  const { label, value, onChange, variant = "outlined", sx, ...rest } = props;

  const [showPW, setShowPW] = useState<boolean>(false);

  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={showPW ? "" : "password"}
      variant={variant}
      sx={{ display: "flex", ...sx }}
      slotProps={{
        input: {
          sx: { pr: 0 },
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                height: "100%",
                maxHeight: "none",
                borderLeft: "1px solid",
                borderColor: "grey.600",
              }}
            >
              <Button
                variant="text"
                onClick={() => setShowPW(!showPW)}
                sx={{
                  height: "100%",
                  aspectRatio: "1 / 1",
                  "&:not(:hover), &:not(:focus)": { opacity: 0.75 },
                  color: "text.primary",
                }}
              >
                {showPW ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </Button>
            </InputAdornment>
          ),
        },
      }}
      {...rest}
    />
  );
};

export default PasswordTextField;
