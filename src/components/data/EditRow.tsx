import React from "react";
import { Box, Divider } from "@mui/material";

interface Props {
  titleL?: string;
  titleR?: string;
  childrenL?: React.ReactNode;
  childrenR?: React.ReactNode;
}
const EditRow = React.memo((props: Props) => {
  const { titleL, titleR, childrenL, childrenR } = props
  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(11, 1fr)",
        sm: "repeat(11, 1fr)",
      },
      gap: "1rem",
      "& .MuiButtonBase-root": {
        boxShadow: 1,
        backgroundColor: "info.light",
      },
      "& .inactive": {
        opacity: 0.75,
      },
      "& .active": {
        opacity: 1,
        outline: "1px solid gold",
        boxShadow: 2,
      },
      "& .Mui-disabled": {
        opacity: 0.25,
        boxShadow: 0,
      },
    }}>
      <Box sx={{
        gridColumn: {
          xs: "span 12",
          sm: "span 4",
        },
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(12, 1fr)",
          sm: "repeat(12, 1fr)"
        }
      }}>
        {childrenL
          ?
          <>
            <Box sx={{
              gridColumn: "span 12",
            }}>
              <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
                {titleL}
              </Divider>
            </Box>
            <Box sx={{
              gridColumn: "span 12",
            }}>
              {childrenL}
            </Box>
          </>
          : ""}
      </Box>
      <Box sx={{
        gridColumn: {
          xs: "span 12",
          sm: "span 7",
        },
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(12, 1fr)",
          sm: "repeat(12, 1fr)"
        }
      }}>
        {childrenR
          ?
          <>
            <Box sx={{
              gridColumn: "span 12",
            }}>
              <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
                {titleR}
              </Divider>
            </Box>
            <Box sx={{
              gridColumn: "span 12",
            }}>
              {childrenR}
            </Box>
          </>
          : ""}
      </Box>
    </Box>
  );
});

export default EditRow;