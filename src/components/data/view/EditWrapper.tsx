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
    <Box sx={{ display: "grid", "& > *": { gridArea: "1 / 1" } }}>
      <Button sx={{
        display: editMode ? "" : "none",
        pointerEvents: editMode ? "" : "none",
        justifySelf: "center",
        alignSelf: "center",
        borderRadius: "4px",
        width: "100%",
        height: "100%",
        zIndex: 10,
        opacity: 0,
        position: "relative",
        ":hover": {
          opacity: 1,
        },
        ":before": {
          position: "absolute",
          content: '""',
          width: "100%",
          height: "100%",
          opacity: 0.8,
          backgroundColor: "background.default",
          zIndex: -1,
        }
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
