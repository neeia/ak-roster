import React from "react";
import { alpha, Box, Button, CircularProgress, Popover, PopoverProps, useTheme } from "@mui/material";
import { FileDownload, Link } from "@mui/icons-material";

interface Props extends PopoverProps {
  save: () => void;
  copy: () => void;
  onClose: () => void;
  saving: boolean;
}

const ShareDialog = (props: Props) => {
  const { save, copy, onClose, saving, ...rest } = props;
  const theme = useTheme();

  return (
    <Popover
      onClose={onClose}
      keepMounted
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            mt: "4px",
          },
        },
      }}
      {...rest}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 0.5,
          p: 0.5,
          backgroundColor: alpha(theme.palette.background.paper, 0.25),
          backdropFilter: "blur(24px) grayscale(50%)",
          "& button": { justifyContent: "end", width: "100%", pl: 2 },
        }}
      >
        <Button
          onClick={save}
          disabled={saving}
          endIcon={saving ? <CircularProgress size={20} /> : <FileDownload />}
          variant="text"
          fullWidth
        >
          Save Image
        </Button>
        <Button onClick={copy} endIcon={<Link />} variant="text" fullWidth>
          Copy Link
        </Button>
      </Box>
    </Popover>
  );
};
export default ShareDialog;
