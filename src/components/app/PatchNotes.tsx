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
            Patch 2.0.0
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
            <ul>
              <li>Entirely rebuilt UI, powered by MUI v5</li>
              <li>Better performance, better accessibility, and faster updates</li>
            </ul>
          </Box>
          <Box>
            Profiles
            <ul>
              <li>Share in-game account info with other Doctors</li>
              <li>Prevent other users from seeing your data by going private</li>
            </ul>
          </Box>
          <Box>
            Smarter Data Management
            <ul>
              <li>No more manual saving - changes uploaded in real time</li>
              <li>Easily update your roster from multiple devices</li>
              <li>Data automatically translates from v1 to v2</li>
            </ul>
          </Box>
          <Box>
            Miscellaneous Changes
            <ul>
              <li>Unowned operators can now be favorited</li>
              <li>Operator pool updated for latest CN patch</li>
              <li>Added an easter egg</li>
            </ul>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default PatchNotes;
