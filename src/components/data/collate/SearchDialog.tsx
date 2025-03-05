import { Clear, Search } from "@mui/icons-material";
import { Dialog, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

interface Props {
  onChange: (value: string) => void;
}

const SearchDialog = memo((props: Props) => {
  const { onChange } = props;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const search = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onChange(text);
  };
  const clear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onChange("");
    setText("");
  };

  const checkSearch = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "f") {
        event.preventDefault();
        setOpen(true);
        input.current?.select();
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    },
    [input]
  );

  useEffect(() => {
    window.addEventListener("keydown", checkSearch);

    return () => {
      window.removeEventListener("keydown", checkSearch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Tooltip title="Search" arrow describeChild>
        <IconButton
          onClick={() => setOpen(!open)}
          aria-label="Search"
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Search fontSize="large" />
          <Typography variant="caption" sx={{ display: { sm: "none" }, lineHeight: 1.1 }}>
            Search
          </Typography>
        </IconButton>
      </Tooltip>
      <Dialog
        disableEnforceFocus
        disableScrollLock
        slotProps={{
          backdrop: {
            style: {
              backgroundColor: "transparent",
              backgroundImage: "linear-gradient(to top, rgba(10, 10, 10, 1), rgba(10, 10, 10, 0) 20%)",
            },
          },
        }}
        sx={{
          pointerEvents: "none",
          width: "100vw",
          top: "unset",
          zIndex: 1000,
        }}
        PaperProps={{ style: { pointerEvents: "auto" } }}
        open={open}
        onClose={() => {
          setOpen(false);
          onChange("");
        }}
      >
        <form>
          <TextField
            sx={{
              backgroundColor: "background.light",
            }}
            autoFocus
            autoComplete="off"
            placeholder="Type to start searching..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            slotProps={{
              htmlInput: {
                ref: input,
              },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="reset"
                      onClick={clear}
                      sx={{
                        opacity: text.length && 1,
                        pointerEvents: text.length === 0 ? "none" : "",
                      }}
                      disabled={text.length === 0}
                    >
                      <Clear />
                    </IconButton>
                    <IconButton type="submit" onClick={search}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </form>
      </Dialog>
    </>
  );
});
SearchDialog.displayName = "SearchDialog";
export default SearchDialog;
