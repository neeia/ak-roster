import React, { useEffect, useRef, useState } from "react";
import { Divider, IconButton, Menu, MenuItem, IconButtonProps } from "@mui/material";
import supabase from "supabase/supabaseClient";
import { Settings } from "@mui/icons-material";
import handleAuthError from "util/fns/handleAuthError";
import Link from "components/base/Link";

interface Props extends IconButtonProps {
  changeUsername?: () => void;
}
const AccountContextMenu = (props: Props) => {
  const { changeUsername, ...rest } = props;

  const [open, setOpen] = useState(false);
  const anchorEl = useRef<HTMLButtonElement | null>(null);
  const handleClick = () => {
    setOpen(true);
  };

  const [showDiscord, setShowDiscord] = useState(false);

  useEffect(() => {
    supabase.auth.getUserIdentities().then(({ data, error }) => {
      if (error?.code) handleAuthError(error);
      setShowDiscord(!data?.identities.find((e) => e.provider === "discord"));
    });
  }, []);

  const linkDiscord = async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: "discord",
      options: {
        redirectTo: window.location.href,
      },
    });
    handleAuthError(error);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      handleAuthError(error);
      return;
    }
    window.location.reload();
  };

  return (
    <>
      <IconButton
        id="account-settings"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        ref={anchorEl}
        {...rest}
      >
        <Settings fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl.current}
        open={open}
        onClose={() => setOpen(false)}
        disableScrollLock
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem component={Link} href="/settings">
          Account Settings
        </MenuItem>
        {changeUsername && <MenuItem onClick={changeUsername}>Change Display Name</MenuItem>}
        {showDiscord && <MenuItem onClick={linkDiscord}>Link Discord</MenuItem>}
        <Divider component="li"></Divider>
        <MenuItem onClick={signOut}>Sign Out</MenuItem>
      </Menu>
    </>
  );
};
export default AccountContextMenu;
