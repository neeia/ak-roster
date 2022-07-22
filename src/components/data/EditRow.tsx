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
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(11, 1fr)",
          sm: "repeat(11, 1fr)",
        }
      }}>
      <Box sx={{
        gridColumn: {
          xs: "span 12",
          sm: "span 4",
        },
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(6, 1fr)",
          sm: "repeat(6, 1fr)"
        }
      }}>
        {childrenL
          ?
          <>
            <Box sx={{
              gridColumn: {
                xs: "span 4",
                sm: "span 12",
              },
            }}>
              <Divider sx={{ display: { xs: "none", sm: "flex" } }} variant="middle" flexItem>
                {titleL}
              </Divider>
            </Box>
            <Box sx={{
              gridColumn: {
                xs: "span 7",
                sm: "span 12",
              },
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
          xs: "repeat(6, 1fr)",
          sm: "repeat(6, 1fr)"
        }
      }}>
        {childrenR
          ?
          <>
            <Box sx={{
              gridColumn: {
                xs: "span 4",
                sm: "span 12",
              },
            }}>
              <Divider sx={{ display: { xs: "none", sm: "flex" } }} variant="middle" flexItem>
                {titleR}
              </Divider>
            </Box>
            <Box sx={{
              gridColumn: {
                xs: "span 7",
                sm: "span 12",
              },
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