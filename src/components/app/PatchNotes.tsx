import React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Link, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Close } from "@mui/icons-material";
import NextLink from "next/link";

const PatchNotes = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const ver = "2.6";

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => { setOpen(true); }} aria-label="Filter">
        <Typography variant="caption2">
          V{ver} - View Patch Notes
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
            Patch {ver}
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          "& ul": {
            my: 0,
          }
        }}>
          <Box>
            Planner
            <ul>
              <li>Ported the Arknights operator planner from <Link href="https://samidare.io/">Samidare</Link></li>
              <li><NextLink href="/planner/goals" passHref><Link>Goals</Link></NextLink> helps you calculate your future material spending</li>
              <li>Completing a goal automatically updates your collection so you don&apos;t have to worry about it</li>
              <li><Link href="https://samidare.io/arknights/planner?migrate=1" rel="noopener">Import your data</Link> from Samidare.io automatically</li>
            </ul>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default PatchNotes;
