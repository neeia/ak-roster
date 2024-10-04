import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import NextLink from "next/link";

const PatchNotes = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const ver = "2.6";

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        aria-label="Filter"
        sx={{ py: "4px" }}
      >
        <Typography variant="caption2">V{ver} - View Patch Notes</Typography>
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        keepMounted
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: "12px",
          }}
        >
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              paddingTop: "12px",
            }}
          >
            Patch {ver}
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ display: { sm: "none" } }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            "& ul": {
              my: 0,
            },
          }}
        >
          <Box>
            <h2>Planner - March 5, 2023</h2>
            <p>Hey, it&apos;s Neia.</p>
            <p>
              The long-awaited <Link href="https://samidare.io/">Samidare</Link>{" "}
              operator planner has arrived! The{" "}
              <Link component={NextLink} href="/planner/goals">
                goals
              </Link>{" "}
              page is now available and ready for use. Here, you can select
              goals, keep track of your depot, and when you complete goals, your
              changes will automatically update your roster.
            </p>
            <p>
              As always, thanks for using Krooster. I&apos;ll keep working hard
              to bring you more exciting updates, so stay tuned!
            </p>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default PatchNotes;
