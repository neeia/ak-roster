import React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Close } from "@mui/icons-material";


const PatchNotes = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => { setOpen(true); }} aria-label="Filter">
        <Typography variant="caption2">
          V2.0.0 - View Patch Notes
        </Typography>
      </Button>
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
            Patch 2.0.0 Notes
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
          <p>
            Krooster has been updated with a whole new look and a whole lot of new features!
          </p>
          <Box>
            General
            We're excited to bring you a fresh coat of paint, powered by MUI v5. This means better performance,
            better accessibility, and faster updates. There's lots more cool stuff coming, too, so stay tuned.
          </Box>
          <Box>
            Profiles
            There are no bad operators, only bad Doctors - that's you! This patch adds the new profile feature,
            which lets you share your in-game info with your fellow Doctors. You can check out the profiles of
            others by looking up their page. Finally, if you're not ready to put everything on display yet, you
            can lock access to your data by setting your account mode to private.
          </Box>
          <Box>
            Miscellaneous Changes
            <ul>
              <li>Unowned operators can now be favorited</li>
              <li>Added an easter egg</li>
            </ul>
          </Box>
          - smarter data management / saving
          - support unit searching
        </DialogContent>
      </Dialog>
    </>
  );
}
export default PatchNotes;
