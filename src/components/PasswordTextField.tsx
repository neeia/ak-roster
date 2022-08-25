import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import React, { useState } from "react";


interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const PasswordTextField = ((props: Props) => {
  const { id, label, value, onChange } = props;

  const [showPW, setShowPW] = useState<boolean>(false);

  return (
    <TextField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      helperText={showPW ? value : ""}
      type="password"
      variant="filled"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {showPW ? "Hide" : "Show"}
            <IconButton
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