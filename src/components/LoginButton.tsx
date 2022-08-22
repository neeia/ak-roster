import React, { useState } from "react";
import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { browserLocalPersistence, getAuth, setPersistence, signInWithEmailAndPassword } from "firebase/auth";

interface Props {
  open: boolean;
  onClose: () => void;
}

const LoginButton = ((props: Props) => {
  const { open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [error, setError] = useState(false);
  const auth = getAuth();

  function handleLogin(
    email: string,
    password: string,
    onError: (e: string) => void
  ): void {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (userCredential != null && userCredential.user != null) {
          // Signed in
          setPersistence(auth, browserLocalPersistence);
          onError("");
        }
      })
      .catch((e) => onError(e.code))
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
              id="Email"
              label="Email"
              variant="filled"
              size="small"
            />
            <TextField
              id="Password"
              label="Password"
              variant="filled"
              size="small"
            />
            <Box sx={{
              display: "flex",
              justifyContent: "space-between"
            }}>
              <FormControlLabel control={<Checkbox />} label="Remember Me" />
              <Button sx={{ color: "text.secondary" }}>
                Forgot Password?
              </Button>
            </Box>
            <Divider />
            <Box sx={{
              display: "flex",
              justifyContent: "space-between"
            }}>
              <Button>
                Log In
              </Button>
              <Button sx={{ color: "text.secondary" }}>
                Sign Up Instead
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
  );
});
export default LoginButton;
