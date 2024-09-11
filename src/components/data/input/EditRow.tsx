import React from "react";
import { Box, Divider } from "@mui/material";

interface Props {
  left?: { title: string, body: React.ReactNode };
  right?: { title: string, body: React.ReactNode };
}
const EditRow = (props: Props) => {
  const { left, right } = props;

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "repeat(11, 1fr)",
      gap: "1rem",
    }}>
      <Box sx={{
        gridColumn: {
          xs: "span 11",
          sm: "span 4",
        },
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(12, 1fr)",
          sm: "repeat(12, 1fr)"
        }
      }}>
        {left
          ?
          <>
            <Box sx={{
              gridColumn: "span 12",
            }}>
              <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
                {left.title}
              </Divider>
            </Box>
            <Box sx={{
              gridColumn: "span 12",
            }}>
              {left.body}
            </Box>
          </>
          : ""}
      </Box>
      <Box sx={{
        gridColumn: {
          xs: "span 11",
          sm: "span 7",
        },
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(12, 1fr)",
          sm: "repeat(12, 1fr)"
        }
      }}>
        {right
          ?
          <>
            <Box sx={{
              gridColumn: "span 12",
            }}>
              <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
                {right.title}
              </Divider>
            </Box>
            <Box sx={{
              gridColumn: "span 12",
            }}>
              {right.body}
            </Box>
          </>
          : ""}
      </Box>
    </Box>
  );
}

export default EditRow;