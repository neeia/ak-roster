import { Box, Button, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import React, { MouseEvent, useEffect, useState } from "react";
import supabase from "supabase/supabaseClient";
import { server } from "util/server";

interface Props {
  open: boolean;
  onClose: () => void;
  email?: string;
}

const ResetPassword = (props: Props) => {
  const { open, onClose } = props;

  const [resetEmail, setResetEmail] = useState<string>("");
  const [errorEmail, setErrorEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState<boolean>(false);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        setResetEmail(data.session?.user.email ?? "");
      }
    };
    getSession();
  }, []);

  function resetPassword(e: MouseEvent) {
    e.preventDefault();
    setLoading(true);
    supabase.auth
      .resetPasswordForEmail(resetEmail, {
        redirectTo: `${server}/settings`,
      })
      .then(() => {
        enqueueSnackbar("Email sent. Please check your inbox.", { variant: "info" });
        setSentEmail(true);
        setLoading(false);
      });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          alignSelf: "start",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          paddingBottom: "12px",
        }}
      >
        Reset Password
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{
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
          }}
        >
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button onClick={resetPassword} type="submit" disabled={loading || sentEmail}>
              {sentEmail ? "Sent!" : loading ? "Loading" : "Confirm"}
            </Button>
            {errorEmail}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPassword;
