import { Box, Typography } from "@mui/material";
import React from "react";

interface Props {
  title? : string,
  content?: React.ReactNode;
  onClearClick?: () => void;
}

const ClearableComponent = (props: Props) => {
  const {title, content, onClearClick} = props;

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "0.25fr 1fr",
      gap: "0px 0px",
      gridTemplateAreas:
        `"title clearButton"
         "component component"`,
    }}>
      <Box sx={{
        gridArea: "title",
        alignContent: "center",
        justifySelf: "start",
      }}>
        <Typography>
          {title}
        </Typography>
      </Box>
      <Box sx={{
        gridArea: "clearButton",
        alignContent: "center",
        justifySelf: "end",
      }}>
        <Typography
          onClick={onClearClick}
          variant="overline"
        >
          CLEAR
        </Typography>
      </Box>
      <Box sx={{
        gridArea: "component"
      }}>
        {content}
      </Box>
    </Box>
  );
};

export default ClearableComponent;