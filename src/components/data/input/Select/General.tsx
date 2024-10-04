import React from "react";
import { Box, ToggleButton } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

interface Props {
  owned?: boolean;
  favorite?: boolean;
  onChangeOwned: () => void;
  onChangeFavorite: () => void;
}
const General = (props: Props) => {
  const { owned, favorite, onChangeOwned, onChangeFavorite } = props;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: "4px",
        "& > *": {
          lineHeight: 0.5,
        },
      }}
    >
      <ToggleButton
        value="owned"
        selected={owned}
        className={owned ? "active" : "inactive"}
        onClick={onChangeOwned}
      >
        Owned
      </ToggleButton>
      <ToggleButton
        value="favorite"
        selected={favorite}
        className={favorite ? "active" : "inactive"}
        onClick={onChangeFavorite}
        disabled={!owned}
        aria-label="favorite"
      >
        {favorite ? (
          <Favorite fontSize="small" color="error" sx={{ m: "2px" }} />
        ) : (
          <FavoriteBorder fontSize="small" color="error" sx={{ m: "2px" }} />
        )}
      </ToggleButton>
    </Box>
  );
};
export default General;
