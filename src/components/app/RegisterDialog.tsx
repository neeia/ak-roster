import React, { useState } from "react";
import { Box, Button, ButtonBase, Dialog, DialogContent, DialogTitle, Divider, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import PasswordTextField from "./PasswordTextField";
import supabase from "supabase/supabaseClient";
import { DISCORD_BLURPLE } from "styles/theme/appTheme";
import Image from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const RegisterForm = ((props: Props) => {
  const { open, onClose, children } = props;
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up('sm'));

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
    const { error } = await supabase.auth.signUp({ email: email.trim(), password: password });
    if (error != null) {
      setError(error.message);
      return;
    }
    setError("Check your mail to confirm your registration.");
  }

  async function signInWithDiscord() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          backgroundImage: "none"
        }
      }}
    >
      <DialogTitle sx={{
        display: "flex",
        justifyContent: "space-between",
      }}>
        <Box component="span" sx={{
          fontSize: "1.5rem",
          p: 1,
        }}>
          Register
        </Box>
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            "& .MuiFormHelperText-root": {
              mt: 1,
              lineHeight: 1
            }
          }}>
          <ButtonBase
            sx={{
              width: "100%",
              height: "100%",
              fontSize: "1rem",
              backgroundColor: DISCORD_BLURPLE,
              display: "flex",
              gap: 1,
              p: 2,
              borderRadius: 1,
              transition: "filter 0.1s",
              ":hover": { filter: "brightness(110%)" },
            }}
            onClick={signInWithDiscord}
          >
            <Image
              src="/img/assets/discord.svg"
              width="24"
              height="18"
              alt=""
            />
            Continue with Discord
          </ButtonBase>
          <Divider>or</Divider>
          <TextField
            label="Email"
            value={email}
            helperText="Your email will be hidden from other users."
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            variant="outlined"
            sx={{ mb: 1 }}
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
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "end",
            gap: 2,
          }}>
            {error}
            <Button
              type="submit"
              onClick={handleRegister}
              color="primary"
              variant="contained"
              sx={{
                p: "8px 16px",
                borderRadius: 1,
              }}
            >
              Create Account
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
});
export default RegisterForm;
