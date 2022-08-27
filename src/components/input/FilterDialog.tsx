import React from "react";
import { Box, Dialog, DialogContent, DialogTitle, useMediaQuery, useTheme } from "@mui/material";

interface Props {
  title: string;
  children?: React.ReactNode;
  open: boolean;
  onClose: () => void;
}

const FilterDialog = (props: Props) => {
  const { title, children, open, onClose } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{
          alignSelf: "start",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          paddingBottom: "12px",
        }}>
          {title}
        </DialogTitle>
        <DialogContent sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Box>
            {children}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default FilterDialog;
