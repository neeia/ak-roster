import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { Alert, Box, Button, ButtonBase, CircularProgress, Divider, TextField, Typography } from "@mui/material";
import Layout from "components/Layout";
import supabase from "supabase/supabaseClient";
import { DISCORD_BLURPLE } from "styles/theme/appTheme";
import PasswordTextField from "components/app/PasswordTextField";
import Head from "components/app/Head";
import config from "data/config";
import Logo, { getLogoUrl } from "components/app/Logo";
import Image from "next/image";
import { server } from "util/server";
import AuthLayout from "components/AuthLayout";
import { useRouter } from "next/router";

const DiscordButton = React.memo((props: { onClick: React.MouseEventHandler }) =>
  <ButtonBase
    sx={{
      width: "100%",
      fontSize: "1rem",
      backgroundColor: DISCORD_BLURPLE,
      display: "flex",
      gap: 1,
      p: 2,
      borderRadius: 1,
      transition: "filter 0.1s",
      ":hover": { filter: "brightness(110%)" },
    }}
    onClick={props.onClick}
  >
    <Image
      src="/img/assets/discord.svg"
      width="24"
      height="18"
      alt=""
    />
    Sign In with Discord
  </ButtonBase>
);

const Login: NextPage = () => {
  const { query, isReady } = useRouter();
  const [redirectTo, setRedirectTo] = useState<string>(server);
  useEffect(() => {
    if (!isReady) return;
    const r = (Array.isArray(query.redirectTo)) ? query.redirectTo[0] : query.redirectTo;
    if (r) setRedirectTo(r)
  }, [isReady])

  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [errorEmail, setErrorEmail] = useState<string | null>();
  const [password, setPassword] = useState<string>("");
  const [errorPw, setErrorPw] = useState<string | null>();

  const [errorSb, setErrorSb] = useState<string | null>();

  async function handleLogin(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setErrorSb(null);
    if (!email) {
      setErrorEmail("This field is required.");
      return;
    }
    if (!password) {
      setErrorPw("This field is required.");
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    if (error) setErrorSb(error.message);
    else {
      setEmail(data.user?.email ?? email.trim());
    }
    setLoading(false);
  }

  async function signInWithDiscord() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo
      }
    });
    if (error) setErrorSb(error.message);
  }



  return (
    <AuthLayout title="Sign in">
      {loading
        ? <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
        :
        <Box component="form" sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 4 },
        }}>
          <TextField
            label="Email"
            value={email}
            helperText={errorEmail}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorEmail(null);
            }}
            onBlur={(e) => {
              if (e.target.value.length === 0) setErrorEmail("This field is required.")
            }}
            error={!!errorEmail}
            variant="outlined"
            required
            sx={{ mb: 1 }}
          />
          <PasswordTextField
            label="Password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length >= 6) setErrorPw("");
            }}
            onBlur={(e) => {
              if (e.target.value.length === 0) setErrorPw("This field is required.")
              else if (e.target.value.length < 6) setErrorPw("Password must have at least 6 characters.")
            }}
            error={!!errorPw}
            helperText={errorPw}
            ariaId="reg-pass"
          />
          {errorSb && <Alert severity="error">{errorSb}</Alert>}
          <Button
            onClick={handleLogin}
            color="primary"
            variant="contained"
            sx={{
              fontSize: "1rem",
              p: 2,
              borderRadius: 1,
              lineHeight: 1,
              ":hover": { color: "primary.light" },
            }}
          >
            Log In
          </Button>
          <Divider></Divider>
          <DiscordButton onClick={signInWithDiscord} />
        </Box>
      }
    </AuthLayout>
  );
}
export default Login;