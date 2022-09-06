import React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, MenuItem, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BadgeOutlined, Close } from "@mui/icons-material";
import { AccountInfo } from "../../types/doctor";
import { SocialInfo } from "../../types/social";


interface Props {
  user?: AccountInfo;
  social?: SocialInfo;
}

const ProfileDialog = (props: Props) => {
  const { user, social } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <IconButton onClick={() => { setOpen(true); }} aria-label="Filter">
        <BadgeOutlined sx={{ color: "background.paper" }} />
      </IconButton>
      Open Profile
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        keepMounted
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: "12px",
        }}>
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              paddingTop: "12px",
            }}>
            {user?.displayName}'s Profile
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          Friend Code: {user?.friendCode?.username}#{user?.friendCode?.tag}
          Server: {user?.server}
          Level: {user?.level}
          Onboard: {user?.onboard}
          Assistant: {user?.assistant}
          Support Units: {user?.support?.map(s => <span>{s.opID}</span>)}
          Discord: {social?.discord?.username}#{social?.discord?.tag}
          Reddit: {social?.reddit}
        </DialogContent>
      </Dialog>
    </>
  );
}
export default ProfileDialog;
