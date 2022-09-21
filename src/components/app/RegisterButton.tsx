import React, { useState } from "react";
import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, getAuth, setPersistence, User } from "firebase/auth";
import PasswordTextField from "./PasswordTextField";
import { FirebaseError } from "firebase/app";
import { authErrors } from "../../util/authErrors";

interface Props {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  onLogin?: (user: User) => void;
}

const RegisterButton = ((props: Props) => {
  const { open, onClose, children, onLogin } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const auth = getAuth();

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  function handleRegister(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();
    if (!email) {
      setError("No email given.");
      return;
    }
    if (!password) {
      setError("No password given.");
      return;
    }
    createUserWithEmailAndPassword(auth, email.trim(), password)
      .then((userCredential) => {
        if (userCredential != null && userCredential.user != null) {
          // Signed in
          setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
          setError("");
          onClose();
          onLogin?.(userCredential.user);
        }
      }).catch((error: FirebaseError) => {
        setError(authErrors[error.code.split("/")[1] as keyof typeof authErrors]);
      })
  };

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
        <Box sx={{
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
          <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />} label="Remember Me" />
          <Divider />
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <Button type="submit" onClick={handleRegister}>
              Enter
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
