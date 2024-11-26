import React, { memo, useContext } from "react";
import { Box, Button, TextField } from "@mui/material";
import { clamp } from "util/changeOperator";
import {
  KeyboardArrowDownSharp,
  KeyboardArrowUpSharp,
  KeyboardDoubleArrowLeftSharp,
  KeyboardDoubleArrowRightSharp,
} from "@mui/icons-material";
import { DisabledContext } from "./SelectGroup";

interface Props {
  value?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (level: number) => void;
}
const Level = memo((props: Props) => {
  const { value: level = 1, min: minLevel = 1, max: maxLevel = 30, disabled: _disabled = false, onChange } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  const [levelField, setLevelField] = React.useState<string>(level.toString());

  function updateLevel(lvl: number) {
    const _lvl = clamp(minLevel, lvl, maxLevel);
    onChange(lvl);
    setLevelField(_lvl.toString());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    console.log(e.key);
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault;
        updateLevel(level + 1);
        break;
      case "ArrowDown":
        e.preventDefault;
        updateLevel(level - 1);
        break;
      case "ArrowRight":
        e.preventDefault;
        updateLevel(level === 1 ? 10 : level + 10);
        break;
      case "ArrowLeft":
        e.preventDefault;
        updateLevel(level - 10);
        break;
      case "End":
        e.preventDefault;
        updateLevel(minLevel);
        break;
      case "Home":
        e.preventDefault;
        updateLevel(maxLevel);
        break;
      default:
        return;
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  const disableDown = disabled || level <= minLevel;

  const disableUp = disabled || level >= maxLevel;

  return (
    <Box
      sx={{
        display: "flex",
        gap: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "32px 56px 32px",
          gridTemplateRows: "32px 56px 32px",
          gridAutoFlow: "column",
          gap: 0.5,
          "& .MuiButton-root": {
            width: "100%",
            height: "100%",
          },
        }}
      >
        <div />
        <Button aria-keyshortcuts="ArrowLeft" onClick={() => updateLevel(level - 10)} disabled={disableDown}>
          <KeyboardDoubleArrowLeftSharp />
        </Button>
        <div />
        <Button aria-keyshortcuts="ArrowUp" onClick={() => updateLevel(level + 1)} disabled={disableUp}>
          <KeyboardArrowUpSharp />
        </Button>
        <TextField
          variant="outlined"
          size="small"
          margin="none"
          value={disabled || levelField ? level : ""}
          error={levelField === ""}
          onChange={(e) => (e.target.value === "" ? setLevelField("") : updateLevel(parseInt(e.target.value)))}
          onKeyDown={handleKeyDown}
          sx={{
            width: "56px",
            height: "56px",
            "& .MuiInputBase-root": {
              height: "100%",
            },
            "& .MuiInputBase-input": {
              textAlign: "center",
              fontSize: "1.5rem",
            },
          }}
          onFocus={handleFocus}
          disabled={disabled}
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              pattern: "[0-9]*",
            },
          }}
        />
        <Button aria-keyshortcuts="ArrowLeft" onClick={() => updateLevel(level - 1)} disabled={disableDown}>
          <KeyboardArrowDownSharp />
        </Button>
        <div />
        <Button
          aria-keyshortcuts="ArrowRight"
          onClick={() => updateLevel(level === 1 ? 10 : level + 10)}
          disabled={disableUp}
        >
          <KeyboardDoubleArrowRightSharp />
        </Button>
        <div />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column-reverse", gap: 1 }}>
        <Button
          sx={{ height: "100%" }}
          aria-keyshortcuts="End"
          title="Shortcut: (End)"
          onClick={() => updateLevel(minLevel)}
          disabled={disableDown}
        >
          Min
        </Button>
        <Button
          sx={{ height: "100%" }}
          aria-keyshortcuts="Home"
          title="Shortcut: (Home)"
          onClick={() => updateLevel(maxLevel)}
          disabled={disableUp}
        >
          Max
        </Button>
      </Box>
    </Box>
  );
});
export default Level;
