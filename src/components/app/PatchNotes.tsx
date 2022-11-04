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
          V2.2 - View Patch Notes
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
            Patch 2.2
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
            Batch Mode
            <ul>
              <li>The batch edit page has been returned to the input page</li>
              <li>Functionally unchanged, but now allows for sort & filter</li>
              <li>Performance of making batch changes improved</li>
            </ul>
          </Box>
          <Box>
            Stultifera Navis
            <ul>
              <li>A new filter has been added for the new 6* selector</li>
              <li>Can be mixed with other filters and on any page</li>
              <li>Filter will remain until selector expires</li>
            </ul>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default PatchNotes;
