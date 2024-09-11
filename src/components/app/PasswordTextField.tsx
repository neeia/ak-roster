import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { IconButton, InputAdornment, OutlinedTextFieldProps, TextField, Typography } from "@mui/material";
import React, { useState } from "react";


interface Props extends Omit<OutlinedTextFieldProps, "variant"> {
  value: string;
  ariaId: string;
}

const PasswordTextField = ((props: Props) => {
  const { label, value, onChange, ariaId, ...rest } = props;

  const [showPW, setShowPW] = useState<boolean>(false);

  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      type={showPW ? "" : "password"}
      variant="outlined"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              tabIndex={-1}
              onClick={() => setShowPW(!showPW)}
            >
              {showPW
                ? <VisibilityOffOutlined fontSize="small" />
                : <VisibilityOutlined fontSize="small" />
              }
            </IconButton>
          </InputAdornment>
        )
      }}
      {...rest}
    />);
});

export default PasswordTextField;