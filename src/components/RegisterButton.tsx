import React, { useState } from "react";
import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

interface Props {
  open: boolean;
  onClose: () => void;
}

const RegisterButton = ((props: Props) => {
  const { open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{
          paddingBottom: "12px",
          width: "100%",
        }}>
          <DialogTitle sx={{
            paddingBottom: "12px",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <Typography variant="h2" component="span">
              Register
            </Typography>
            <IconButton onClick={onClose}>
              <CloseOutlined />
            </IconButton>
          </DialogTitle>
        </DialogTitle>
        <DialogContent>
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: "12px 6px",
            "& .MuiFormHelperText-root": {
              mt: 1,
              lineHeight: 1
            }
          }}>
            <TextField
              id="Username"
              label="Username"
              helperText="Your username must be unique and will be visible to other users."
              variant="filled"
              size="small"
            />
            <TextField
              id="Email"
              label="Email"
              helperText="Your email is used for authentication and is hidden to other users."
              variant="filled"
              size="small"
            />
            <TextField
              id="Password"
              label="Password"
              helperText="Your password must be at least 6 characters long."
              variant="filled"
              size="small"
            />
            <TextField
              id="Repeat Password"
              label="Repeat Password"
              variant="filled"
              size="small"
            />
            <FormControlLabel control={<Checkbox />} label="Remember Me" />
            <Divider />
            <Box sx={{
              display: "flex",
              justifyContent: "space-between"
            }}>
              <Button>
                Register and Log In
              </Button>
              <Button sx={{ color: "text.secondary" }}>
                Log In Instead
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
  );
});
export default RegisterButton;
