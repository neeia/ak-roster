import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Alert, Box, Button, ButtonBase, CircularProgress, Divider, TextField, Typography } from "@mui/material";
import supabase from "supabase/supabaseClient";
import { DISCORD_BLURPLE } from "styles/theme/appTheme";
import PasswordTextField from "components/app/PasswordTextField";
import AuthLayout from "components/AuthLayout";
import { useRouter } from "next/router";
import useAccount from "util/hooks/useAccount";
import { enqueueSnackbar } from "notistack";
import ResetPassword from "components/app/ResetPassword";
import Image from "components/base/Image";
import imageBase from "util/imageBase";

function DiscordButton(props: { onClick: React.MouseEventHandler }) {
  return (
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
      <Image src={`${imageBase}/assets/icons/discord.svg`} sx={{ width: "20px", height: "15px" }} alt="" />
      Sign In with Discord
    </ButtonBase>
  );
}

const Login: NextPage = () => {
  const { query, isReady } = useRouter();
  const [redirectTo, setRedirectTo] = useState<string>(typeof window === "undefined" ? "" : document?.location?.origin);
  useEffect(() => {
    if (!isReady) return;
    const r = Array.isArray(query.redirectTo) ? query.redirectTo[0] : query.redirectTo;
    if (r) setRedirectTo(r);
  }, [isReady, query.redirectTo]);

  const [account] = useAccount();
  useEffect(() => {
    if (account) window.location.href = redirectTo ?? "/";
  }, [account, redirectTo]);

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
      password: password,
    });
    if (error) {
      setErrorSb(error.message);
      if (error.code === "email_not_confirmed") {
        setResend(true);
      }
    } else {
      window.location.href = redirectTo ?? "/";
    }
    setLoading(false);
  }

  async function signInWithDiscord() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo,
      },
    });
    if (error) setErrorSb(error.message);
  }

  const [resend, setResend] = useState(false);
  async function resendVerify(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault();
    if (!email) {
      setErrorEmail("This field is required.");
      return;
    }
    if (!password) {
      setErrorPw("This field is required.");
      return;
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) setErrorSb(error.message);
    else enqueueSnackbar("Verification email resent.", { variant: "success" });
  }

  const [resetOpen, setResetOpen] = useState<boolean>(false);
  return (
    <AuthLayout title="Sign in" path="/login">
      {loading ? (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, sm: 4 },
          }}
        >
          <TextField
            label="Email"
            value={email}
            helperText={errorEmail}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorEmail(null);
            }}
            onBlur={(e) => {
              if (e.target.value.length === 0) setErrorEmail("This field is required.");
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
              if (e.target.value.length === 0) setErrorPw("This field is required.");
              else if (e.target.value.length < 6) setErrorPw("Password must have at least 6 characters.");
            }}
            error={!!errorPw}
            helperText={errorPw}
          />
          {errorSb && (
            <Alert severity="error">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, fontSize: "0.875rem" }}>
                <Typography>{errorSb}</Typography>
                {resend && (
                  <Button variant="contained" onClick={resendVerify}>
                    Resend Verification Email
                  </Button>
                )}
              </Box>
            </Alert>
          )}
          <Button
            type="submit"
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
          <Button onClick={() => setResetOpen(true)}>Forgot Password?</Button>
          <ResetPassword open={resetOpen} onClose={() => setResetOpen(false)} />
          <Divider></Divider>
          <DiscordButton onClick={signInWithDiscord} />
        </Box>
      )}
    </AuthLayout>
  );
};
export default Login;
