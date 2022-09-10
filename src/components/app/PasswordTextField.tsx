import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import React, { useState } from "react";


interface Props {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  ariaId: string;
}

const PasswordTextField = ((props: Props) => {
  const { label, value, onChange, ariaId } = props;

  const [showPW, setShowPW] = useState<boolean>(false);

  return (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      helperText={showPW ? value : ""}
      type="password"
      variant="filled"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Typography id={`show-pw-${ariaId}`}>
              {showPW ? "Hide" : "Show"}
            </Typography>
            <IconButton
              aria-labelledby={`show-pw-${ariaId}`}
              tabIndex={-1}
              onClick={() => setShowPW(!showPW)}
            >
              {showPW
                ? <VisibilityOffOutlined height="1rem" />
                : <VisibilityOutlined height="1rem" />
              }
            </IconButton>
          </InputAdornment>
        )
      }}
    />);
});

export default PasswordTextField;