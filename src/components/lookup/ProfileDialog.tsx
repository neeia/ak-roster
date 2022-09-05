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
        <BadgeOutlined fontSize="large" color="primary" />
      </IconButton>
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
            {user?.displayName}
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

        </DialogContent>
      </Dialog>
    </>
  );
}
export default ProfileDialog;
