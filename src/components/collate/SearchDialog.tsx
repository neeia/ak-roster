import { Clear, Search } from "@mui/icons-material";
import { Dialog, IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";

interface Props {
  setSearch: (search: string) => void;
}

const SearchDialog = (props: Props) => {
  const { setSearch } = props;
  const [searchText, setSearchText] = React.useState("")
  const [open, setOpen] = React.useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setSearch(e.target.value);
  };
  const search = (e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setSearch(searchText); };
  const clear = (e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); setSearchText(""); setSearch(""); };

  return (
    <>
      <IconButton onClick={() => setOpen(!open)} aria-label="Search" >
        <Search fontSize="large" color="primary" />
      </IconButton>
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
          zIndex: 1000,
        }}
        PaperProps={{ style: { pointerEvents: 'auto' } }}
        open={open}
        onClose={() => { setOpen(false); setSearchText(""); setSearch(""); }}
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
    </>);
}
export default SearchDialog;