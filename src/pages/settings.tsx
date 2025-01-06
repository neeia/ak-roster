import React, { useContext, useEffect, useState } from "react";
import type { NextPage } from "next";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import Layout from "components/Layout";
import useAccount from "util/hooks/useAccount";
import { ContentPasteOutlined, InventoryOutlined } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import supabase from "supabase/supabaseClient";
import handlePostgrestError from "util/fns/handlePostgrestError";
import { UserContext } from "./_app";
import PasswordTextField from "components/app/PasswordTextField";
import ResetPassword from "components/app/ResetPassword";
import handleAuthError from "util/fns/handleAuthError";
import { UserIdentity } from "@supabase/supabase-js";
import { useRouter } from "next/router";

function isValidUsername(input: string) {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return input && regex.test(input) && input.length < 32;
}

const Settings: NextPage = () => {
  const [account, setAccount, { loading }] = useAccount();

  const alert = (message: string, variant?: "default" | "error" | "success" | "warning" | "info") =>
    enqueueSnackbar(message, { variant: variant || "error" });

  const [username, setUsername] = useState("");
  const [display_name, setDisplayName] = useState("");
  const [copyLink, setCopiedLink] = useState(false);

  const [discordIdentity, setDiscordIdentity] = useState<UserIdentity>();
  const [emailIdentity, setEmailIdentity] = useState<UserIdentity>();

  const { asPath } = useRouter();
  useEffect(() => {
    const hash = asPath.split("#")[1];
    if (hash?.startsWith("access_token=")) {
      window.history.replaceState(null, "", asPath.split("#")[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asPath]);

  useEffect(() => {
    supabase.auth.getUserIdentities().then(({ data, error }) => {
      if (error) handleAuthError(error);
      const _discordIdentity = data?.identities.find((e) => e.provider === "discord");
      setDiscordIdentity(_discordIdentity);
      const _emailIdentity = data?.identities.find((e) => e.provider === "email");
      setEmailIdentity(_emailIdentity);
    });
  }, []);

  const user = useContext(UserContext);

  const updateUsername = async () => {
    if (!username || !account) return;
    if (username.length > 32) {
      alert("Use a maximum of 32 characters.");
      return;
    }
    if (!isValidUsername(username)) {
      alert("Chosen username has invalid characters.");
      return;
    }
    const { count, error: sberror } = await supabase
      .from("krooster_accounts")
      .select("*", { count: "exact", head: true })
      .eq("username", username);
    handlePostgrestError(sberror);

    if (count == null) return;
    if (count) {
      alert("That username is taken.");
      return;
    }
    const dn = account.display_name;

    setAccount({
      ...account,
      username,
      display_name: dn === account.username ? username : dn,
    });
  };

  const updateDisplayName = async () => {
    if (!display_name || !account) return;
    if (display_name.length > 32) {
      alert("Use a maximum of 32 characters.");
      return;
    }

    setAccount({ ...account, display_name: display_name });
  };

  const [email, setEmail] = useState("");

  async function updateEmail() {
    const { error } = await supabase.auth.updateUser(
      { email: email },
      {
        emailRedirectTo: window.location.href,
      }
    );
    if (error) handleAuthError(error);
    else alert("Check your new e-mail to confirm the e-mail change.");
  }

  const [password1, setNewPassword] = useState<string>("");
  const [password2, setRepeatPassword] = useState<string>("");

  const [resetOpen, setResetOpen] = useState<boolean>(false);

  async function changePassword() {
    const { error } = await supabase.auth.updateUser({
      password: password1,
    });
    if (error) handleAuthError(error);
    else alert("Password changed.");
  }

  const linkDiscord = async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: "discord",
      options: {
        redirectTo: window.location.href,
      },
    });
    handleAuthError(error);
  };

  const unlinkDiscord = async () => {
    if (!discordIdentity) return;
    const { error } = await supabase.auth.unlinkIdentity(discordIdentity);
    handleAuthError(error);
  };

  return (
    <Layout tab="" page="/settings">
      {loading || !account ? (
        ""
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: "sm",
            "& *:before": {
              border: "none",
              borderStyle: "none !important",
            },
            "& .MuiFilledInput-root": {
              borderRadius: "4px",
            },
            "& > * > .MuiButton-root": {
              width: "fit-content",
            },
          }}
        >
          <Button
            sx={{ display: "flex", width: "100%" }}
            onClick={() => {
              setCopiedLink(true);
              navigator.clipboard.writeText(`https://krooster.com/u/${account.username}`);
            }}
          >
            <TextField
              label="Share Link"
              value={account.username ? `https://www.krooster.com/u/${account.username}` : "---"}
              variant="standard"
              disabled
              fullWidth
              sx={{ pointerEvents: "none" }}
            />
            <Typography sx={{ mr: 1 }}>{copyLink ? "Copied!" : "Copy"}</Typography>
            {copyLink ? <InventoryOutlined height="1rem" /> : <ContentPasteOutlined height="1rem" />}
          </Button>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h2" sx={{ fontSize: "18px" }}>
              Change Username
            </Typography>
            <TextField
              label="Current Username"
              value={account.username ?? "No Username Set"}
              variant="standard"
              disabled
            />
            <TextField
              label="New Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLocaleLowerCase());
              }}
              helperText="Valid Characters: [a-z], [0-9], underscore (_), and hyphen (-). Max length of 32."
              variant="filled"
            />
            <Button onClick={updateUsername} disabled={!username || username === account.username}>
              Change Username
            </Button>
          </Box>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h2" sx={{ fontSize: "18px" }}>
              Change Display Name
            </Typography>
            <TextField
              label="Current Display Name"
              value={account.display_name || "No Display Name Set"}
              variant="standard"
              disabled
            />
            <TextField
              label="New Display Name"
              value={display_name}
              onChange={(e) => {
                setDisplayName(e.target.value);
              }}
              variant="filled"
            />
            <Button
              onClick={updateDisplayName}
              disabled={!display_name || display_name === account.display_name || display_name.length > 32}
            >
              Change Display Name
            </Button>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h2" sx={{ fontSize: "24px" }}>
              Identities
            </Typography>
            <p>
              Unlinking an identity will remove it from your account. You will no longer be able to log in using that
              identity.
            </p>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <TextField
              label="Discord"
              value={discordIdentity ? discordIdentity.identity_data?.["full_name"] : "Not Linked"}
              disabled
            />
            {discordIdentity ? (
              <Button onClick={unlinkDiscord} disabled={!emailIdentity}>
                Unlink Discord
              </Button>
            ) : (
              <Button onClick={linkDiscord}>Link Discord</Button>
            )}
            <TextField
              label="Email"
              value={emailIdentity ? emailIdentity.identity_data?.["email"] : "Not Linked"}
              disabled
              sx={{ mt: 2 }}
            />
          </Box>
          {emailIdentity && (
            <>
              <Divider />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="h2" sx={{ fontSize: "18px" }}>
                  Change Email
                </Typography>
                <TextField label="Current Email" value={user?.email} variant="standard" disabled />
                <TextField
                  label="New Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  variant="filled"
                />
                <Button onClick={updateEmail} disabled={!email}>
                  Change Email
                </Button>
              </Box>
              <Divider />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="h2" sx={{ fontSize: "18px" }} id="change-password">
                  Change Password
                </Typography>
                <PasswordTextField
                  label="New Password"
                  value={password1}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                  }}
                  variant="filled"
                />
                <PasswordTextField
                  label="Repeat Password"
                  value={password2}
                  onChange={(e) => {
                    setRepeatPassword(e.target.value);
                  }}
                  error={password1 !== password2}
                  variant="filled"
                />
                <Button onClick={changePassword} disabled={!password1 || !password2 || password1 !== password2}>
                  Change Password
                </Button>
                <Button onClick={() => setResetOpen(true)}>Forgot Password?</Button>
              </Box>
            </>
          )}
          <ResetPassword open={resetOpen} onClose={() => setResetOpen(false)} />
        </Box>
      )}
    </Layout>
  );
};
export default Settings;
