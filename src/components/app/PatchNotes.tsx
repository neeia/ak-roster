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
          V2.0 - View Patch Notes
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
            Patch 2.1
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
          <Box>
            Edit from View
            <ul>
              <li>You can now open the operator editor from the view tab</li>
              <li>Provides smoother UX for finding and correcting mistakes</li>
              <li>Try it out by going to View, and clicking on the pencil icon</li>
            </ul>
          </Box>
          <Box>
            Bugfixes
            <ul>
              <li>Fixed an issue causing usernames to not appear properly</li>
              <li>Fixed an issue causing the first slot of support units to include 6* units</li>
            </ul>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default PatchNotes;
