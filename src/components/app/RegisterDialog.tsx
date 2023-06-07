import React, { useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import PasswordTextField from "./PasswordTextField";
import supabaseClient from "../../util/supabaseClient";
import {Session} from "@supabase/gotrue-js";

interface Props {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  onLogin?: (session: Session) => void;
}

const RegisterButton = ((props: Props) => {
  const { open, onClose, children, onLogin } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleRegister(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault();
    if (!email) {
      setError("No email given.");
      return;
    }
    if (!password) {
      setError("No password given.");
      return;
    }
    const { data, error } = await supabaseClient.auth.signUp({ email: email.trim(), password: password });
    if (error != null) {
      setError(error.message);
      return;
    }

    setError("");
    onClose();
    onLogin?.(data.session!);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{
        paddingBottom: "12px",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <Typography variant="h2" component="span">
          Register
        </Typography>
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px 6px",
            "& .MuiFormHelperText-root": {
              mt: 1,
              lineHeight: 1
            }
          }}>
          <TextField
            label="Email"
            value={email}
            helperText="Your email is used for authentication and is hidden to other users."
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            variant="filled"
          />
          <PasswordTextField
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            ariaId="reg-pass"
          />
          <Divider />
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Button type="submit" onClick={handleRegister}>
              Create Account
            </Button>
            {error}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", }}>
            {children}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
});
export default RegisterButton;
