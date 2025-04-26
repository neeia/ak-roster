import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Alert, Box, Button, ButtonBase, CircularProgress, Divider, TextField, Typography } from "@mui/material";
import supabase from "supabase/supabaseClient";
import { DISCORD_BLURPLE } from "styles/theme/appTheme";
import PasswordTextField from "components/app/PasswordTextField";
import AuthLayout from "components/AuthLayout";
import { enqueueSnackbar } from "notistack";
import useAccount from "util/hooks/useAccount";
import { useRouter } from "next/router";
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
      <Image src={`${imageBase}/assets/icons/discord.svg`} width="20" height="15" alt="" />
      Continue with Discord
    </ButtonBase>
  );
}

enum RegisterState {
  Default,
  Email,
  Verify,
}

const Register: NextPage = () => {
  const { query, isReady } = useRouter();
  useEffect(() => {
    if (!isReady) return;
    const r = Array.isArray(query.flow) ? query.flow[0] : query.flow;
    switch (r) {
      case "email":
        setFlow(RegisterState.Email);
        break;
      case "verify":
        setFlow(RegisterState.Verify);
        break;
      default:
        setFlow(RegisterState.Default);
        break;
    }
  }, [isReady, query.flow]);

  const [flow, setFlow] = useState(RegisterState.Default);
  const [loading, setLoading] = useState(false);

  const [account] = useAccount();
  useEffect(() => {
    if (account) window.location.href = "/";
  }, [account]);

  const [email, setEmail] = useState<string>("");
  const [errorEmail, setErrorEmail] = useState<string | null>();
  const [password, setPassword] = useState<string>("");
  const [errorPw, setErrorPw] = useState<string | null>();

  const [errorSb, setErrorSb] = useState<string | null>();

  async function handleRegister(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
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
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        emailRedirectTo: `${document.location.origin}`,
      },
    });
    if (error) setErrorSb(error.message);
    else {
      setEmail(data.user?.email ?? email.trim());
      setFlow(RegisterState.Verify);
    }
    setLoading(false);
  }

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
        emailRedirectTo: `${document.location.origin}`,
      },
    });
    if (error) setErrorSb(error.message);
    else enqueueSnackbar("Verification email resent.", { variant: "success" });
  }

  async function signInWithDiscord() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${document.location.origin}`,
      },
    });
    if (error) setErrorSb(error.message);
  }

  const title: Record<RegisterState, string> = {
    [RegisterState.Default]: "Choose a sign up method",
    [RegisterState.Email]: "Create account",
    [RegisterState.Verify]: "Verify your email",
  };
  const render: Record<RegisterState, React.ReactNode> = {
    [RegisterState.Default]: (
      <>
        <DiscordButton onClick={signInWithDiscord} />
        <Typography component="p">
          If you don't have a Discord account, Krooster still supports traditional password-based registration. Your
          email is used only to log in and is kept private.
        </Typography>
        <Button
          onClick={() => setFlow(RegisterState.Email)}
          color="primary"
          variant="outlined"
          sx={{
            fontSize: "1rem",
            p: 2,
            borderRadius: 1,
            lineHeight: 1,
            ":hover": { color: "primary.light" },
          }}
        >
          Continue with Email
        </Button>
      </>
    ),
    [RegisterState.Email]: (
      <>
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
            helperText={errorEmail ?? "Your email is kept private."}
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
          {errorSb && <Alert severity="error">{errorSb}</Alert>}
          <Button
            type="submit"
            onClick={handleRegister}
            color="primary"
            variant="contained"
            sx={{
              fontSize: "1rem",
              p: 2,
              borderRadius: 1,
              lineHeight: 1,
              ":hover": { backgroundColor: "primary.light" },
            }}
          >
            Create Account
          </Button>
          <Divider></Divider>
          <DiscordButton onClick={signInWithDiscord} />
        </Box>
      </>
    ),
    [RegisterState.Verify]: (
      <>
        <Box>
          You're almost done! We sent a link to {email} to verify your email address and activate your account. This
          link will expire in 24 hours. You may need to check your spam folder.
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          Didn't receive an email?
          <ButtonBase
            onClick={resendVerify}
            sx={{
              display: "inline",
              color: "primary.main",
              fontSize: "1rem",
              ":focus": { outline: "1px solid white" },
            }}
          >
            Resend
          </ButtonBase>
        </Box>
      </>
    ),
  };

  return (
    <AuthLayout title={title[flow]} path="/register">
      {loading ? (
        <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        render[flow]
      )}
    </AuthLayout>
  );
};
export default Register;
