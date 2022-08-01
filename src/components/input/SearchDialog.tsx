import { Search } from "@mui/icons-material";
import { Dialog, IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  setSearch: (search: string) => void;
}

const SearchDialog = React.memo((props: Props) => {
  const { open, onClose,  setSearch } = props;
  const [searchText, setSearchText] = React.useState("")

  return (
    <Dialog
      disableEnforceFocus
      disableScrollLock
      componentsProps={{
        backdrop: {
          style: {
            backgroundColor: "transparent",
            backgroundImage: "linear-gradient(to top, rgba(10, 10, 10, 1), rgba(10, 10, 10, 0) 20%)"
          }
        }
      }}
      sx={{
        pointerEvents: "none",
        position: "fixed",
        top: "unset",
      }}
      PaperProps={{ style: { pointerEvents: 'auto' } }}
      open={open}
      onClose={onClose}
    >
      <form>
        <TextField
          sx={{
            backgroundColor: "#333333",
          }}
          autoComplete="off"
          placeholder="Type to start searching..."
          value={searchText}
          onChange={e => { setSearchText(e.target.value); setSearch(e.target.value); }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" onClick={(e) => { e.preventDefault(); setSearch(searchText); }}>
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </form>
    </Dialog>
  );
});
export default SearchDialog;