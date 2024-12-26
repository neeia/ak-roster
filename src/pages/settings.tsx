import React, { useState } from "react";
import type { NextPage } from "next";
import { Box, Button, Divider, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import Layout from "components/Layout";
import UpdateEmail from "components/settings/UpdateEmail";
import UpdatePassword from "components/settings/UpdatePassword";
import useAccount from "util/hooks/useAccount";
import UpdatePrivacy from "components/settings/UpdatePrivacy";
import { ContentPasteOutlined, InventoryOutlined } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import supabase from "supabase/supabaseClient";
import handlePostgrestError from "util/fns/handlePostgrestError";

function isValidUsername(input: string) {
  const regex = /^[a-zA-Z0-9_-]+$/;
  return input && regex.test(input) && input.length < 32;
}

const Settings: NextPage = () => {
  const [account, setAccount, { loading }] = useAccount();

  const error = (message: string) => enqueueSnackbar(message, { variant: "error" });

  const [username, setUsername] = useState("");
  const [display_name, setDisplayName] = useState("");
  const [copyLink, setCopiedLink] = useState(false);

  const updateUsername = async () => {
    if (!username || !account) return;
    if (username.length > 32) {
      error("Use a maximum of 32 characters.");
      return;
    }
    if (!isValidUsername(username)) {
      error("Chosen username has invalid characters.");
      return;
    }
    const { count, error: sberror } = await supabase
      .from("krooster_accounts")
      .select("*", { count: "exact", head: true })
      .eq("username", username);
    handlePostgrestError(sberror);

    if (count == null) return;
    if (count) {
      error("That username is taken.");
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
      error("Use a maximum of 32 characters.");
      return;
    }

    setAccount({ ...account, display_name: username });
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
            gap: "12px 6px",
            maxWidth: "sm",
            "& *:before": {
              border: "none",
              borderStyle: "none !important",
            },
            "& .MuiFilledInput-root": {
              borderRadius: "4px",
            },
            "& > .MuiButton-root": {
              width: "fit-content",
            },
          }}
        >
          <TextField
            label="Share Link"
            value={account.username ? `https://www.krooster.com/u/${account.username}` : "---"}
            variant="standard"
            disabled
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography id="copy-label">{copyLink ? "Copied!" : "Copy"}</Typography>
                  <IconButton
                    aria-labelledby="copy-label"
                    onClick={() => {
                      setCopiedLink(true);
                      navigator.clipboard.writeText(`https://krooster.com/u/${account.display_name}`);
                    }}
                  >
                    {copyLink ? <InventoryOutlined height="1rem" /> : <ContentPasteOutlined height="1rem" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Divider />
          Change Username
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
          <Divider />
          Change Display Name
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
          <Divider />
          <UpdateEmail />
          <Divider />
          <UpdatePassword user={account} />
        </Box>
      )}
    </Layout>
  );
};
export default Settings;
