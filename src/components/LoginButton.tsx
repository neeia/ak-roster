import React, { useState } from "react";
import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { browserLocalPersistence, browserSessionPersistence, getAuth, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import PasswordTextField from "./PasswordTextField";
import ResetPassword from "./ResetPassword";

interface Props {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const LoginButton = ((props: Props) => {
  const { open, onClose, children } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const auth = getAuth();

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [resetOpen, setResetOpen] = useState<boolean>(false);

  function handleLogin(e: React.MouseEvent<HTMLButtonElement>): void {
    e.preventDefault();
    if (!email) {
      setError("No email given.");
      return;
    }
    if (!password) {
      setError("No password given.");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (userCredential != null && userCredential.user != null) {
          // Signed in
          setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
          setError("");
          onClose();
        }
      }).catch(() => {
        setError("Failed to authenticate.");
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
          Log In
        </Typography>
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px 6px",
            "& .MuiFormHelperText-root": {
              mt: 1,
              lineHeight: 1
            }
          }}
        >
          <TextField
            id="Enter Email"
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            variant="filled"
          />
          <PasswordTextField
            id="Password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            ariaId="logn-pass"
          />
          <FormControlLabel control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />} label="Remember Me" />
          <Divider />
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Button type="submit" onClick={handleLogin}>
              Log In
            </Button>
            {error}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", }}>
            <Button onClick={() => setResetOpen(true)} sx={{ color: "text.secondary" }}>
              Forgot Password?
            </Button>
            <ResetPassword open={resetOpen} onClose={() => setResetOpen(false)} email={email} />
            {children}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
});
export default LoginButton;
