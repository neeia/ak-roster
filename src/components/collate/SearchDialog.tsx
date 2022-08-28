import { Clear, Search } from "@mui/icons-material";
import { Dialog, IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  setSearch: (search: string) => void;
}

const SearchDialog = (props: Props) => {
  const { open, onClose, setSearch } = props;
  const [searchText, setSearchText] = React.useState("")

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    if (e.target.value === "") {
      setSearch("");
    }
  };
  const search = (e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setSearch(searchText); };
  const clear = (e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setSearchText(""); setSearch(""); };

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
        width: "100vw",
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
          autoFocus
          autoComplete="off"
          placeholder="Type to start searching..."
          value={searchText}
          onChange={onChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="reset"
                  onClick={clear}
                  sx={{
                    opacity: searchText.length,
                    pointerEvents: searchText.length === 0 ? "none" : "",
                  }}
                  disabled={searchText.length === 0}
                >
                  <Clear />
                </IconButton>
                <IconButton type="submit" onClick={search}>
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </form>
    </Dialog>
  );
}
export default SearchDialog;