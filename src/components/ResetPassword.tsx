import { Box, Button, Dialog, DialogContent, DialogTitle, Popover, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  email?: string;
}

const ResetPassword = ((props: Props) => {
  const { open, onClose, email } = props;
  const auth = getAuth();
  const theme = useTheme();

  const [resetEmail, setResetEmail] = useState<string>(email ?? "");
  const [errorEmail, setErrorEmail] = useState<string>("");
  const [sentEmail, setSentEmail] = useState<boolean>(false);

  function resetPassword() {
    sendPasswordResetEmail(auth, resetEmail).then(() => {
      setSentEmail(true);
    }).catch(() => {
      console.log("Unknown exception occured when resetting password.")
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle sx={{
        alignSelf: "start",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        paddingBottom: "12px",
      }}>
        Reset Password
      </DialogTitle>
      <DialogContent sx={{
        display: "flex",
        flexDirection: "column",
        gap: "12px 6px",
        maxWidth: "sm",
        "& *:before": {
          border: "none",
          borderStyle: "none !important",
        },
        "& .MuiFilledInput-root": {
          borderRadius: "2px",
        },
      }}>
        <TextField
          id="Enter Email"
          label="Enter Email"
          value={resetEmail}
          onChange={(e) => {
            setResetEmail(e.target.value);
            setErrorEmail("");
          }}
          variant="filled"
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button onClick={resetPassword}>
            Confirm
          </Button>
          {errorEmail}
        </Box>
      </DialogContent>
    </Dialog>
  );
});

export default ResetPassword;