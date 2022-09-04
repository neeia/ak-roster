import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Close, InfoOutlined } from "@mui/icons-material";


interface Props {
}

const HelpDialog = (props: Props) => {
  const { } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <IconButton onClick={() => { setOpen(true); }} aria-label="Filter">
        <InfoOutlined fontSize="large" color="primary" />
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
            Info
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ display: { sm: "none" } }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          "& .inactive": {
            opacity: 0.9,
            py: "0.6rem",
          },
          "& .active": {
            opacity: 1,
            boxShadow: 0,
            pt: "0.6rem",
            borderBottomWidth: "0.25rem",
            borderBottomColor: "primary.main",
            borderBottomStyle: "solid",
            backgroundColor: "info.light",
          },
        }}>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default HelpDialog;
