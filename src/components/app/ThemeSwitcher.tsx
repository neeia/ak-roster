import { Box, Button } from "@mui/material";
import { LightContext } from "pages/_app";
import React, { useContext } from "react";

const ThemeSwitcher = () => {
  const lightMode = useContext(LightContext);

  return (
    lightMode && (
      <Box>
        {lightMode[0] ? (
          <Button onClick={() => lightMode[1](false)}>Switch to Dark Theme</Button>
        ) : (
          <Button onClick={() => lightMode[1](true)}>Switch to Light Theme</Button>
        )}
      </Box>
    )
  );
};
export default ThemeSwitcher;
