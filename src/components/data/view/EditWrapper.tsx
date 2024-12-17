import React from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { ModeEdit } from "@mui/icons-material";

interface Props {
  editMode?: boolean;
  children?: React.ReactNode;
  onClick: () => void;
}

const EditWrapper = React.memo((props: Props) => {
  const { editMode, children, onClick } = props;

  return (
    <Box sx={{ display: "grid", height: "min-content", "& > *": { gridArea: "1 / 1" } }}>
      <Button
        sx={{
          display: editMode ? "flex" : "none",
          pointerEvents: editMode ? "" : "none",
          borderRadius: "4px",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          zIndex: 10,
          opacity: 0,
          position: "relative",
          transition: "opacity 0.1s",
          ":hover": {
            opacity: 1,
          },
          ":before": {
            position: "absolute",
            borderRadius: "4px",
            content: '""',
            width: "100%",
            height: "100%",
            backgroundColor: "background.light",
            zIndex: -1,
          },
        }}
        disabled={!editMode}
        onClick={onClick}
      >
        <ModeEdit fontSize="large" color="primary" />
        Edit
      </Button>
      {children}
    </Box>
  );
});
EditWrapper.displayName = "Edit Wrapper";
export default EditWrapper;
