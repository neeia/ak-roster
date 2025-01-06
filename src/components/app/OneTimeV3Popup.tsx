import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import useLocalStorage from "util/hooks/useLocalStorage";

interface Props {}

const OneTimeV3Popup = (props: Props) => {
  const [_open, _setOpen] = useLocalStorage("v3_onetimenotif", true);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(_open);
  }, [_open]);

  const [repeat, setRepeat] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRepeat(event.target.checked);
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Krooster V3 is out!</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxWidth: "sm",
          "& > p + h3": {
            mt: 2,
          },
        }}
      >
        <Typography>Here's what you need to know.</Typography>
        <Typography variant="h3">Your Account</Typography>
        <Typography>
          We changed our account provider - you can log in as before, but you will be asked to verify your email if you
          haven't already. You can also sign in with Discord.
        </Typography>
        <Typography variant="h3">Your Data</Typography>
        <Typography>
          We made our best effort to migrate as much data as we could. You can also now import your data directly from
          the game.
        </Typography>
        <Typography variant="h3">Issues</Typography>
        <Typography>
          New year, new Krooster, new bugs. If you find an issue, please let us know on our Discord server. It helps a
          lot.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ width: "100%", justifyContent: "space-between", pl: 3, pr: 2 }}>
        <FormControlLabel control={<Checkbox checked={repeat} onChange={handleChange} />} label="Don't show again" />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (repeat) {
              _setOpen(false);
            } else setOpen(false);
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OneTimeV3Popup;
