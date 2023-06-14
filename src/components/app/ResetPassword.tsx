import { Box, Button, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import React, {useEffect, useState} from "react";
import supabaseClient from "../../util/supabaseClient";

interface Props {
  open: boolean;
  onClose: () => void;
  email?: string;
}

const ResetPassword = ((props: Props) => {
  const { open, onClose } = props;

  const [resetEmail, setResetEmail] = useState<string>("");
  const [errorEmail, setErrorEmail] = useState<string>("");
  const [sentEmail, setSentEmail] = useState<boolean>(false);

  useEffect( () => {
    const getSession = async () =>
    {
      const {data, error} = await supabaseClient.auth.getSession();
      if (!error) {
        setResetEmail(data.session?.user.email ?? "");
      }
    }
    getSession().then();
  });

  function resetPassword() {

    supabaseClient.auth.resetPasswordForEmail(resetEmail).then(() => setSentEmail(true
    ))
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