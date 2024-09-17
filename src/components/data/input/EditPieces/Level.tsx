import React, { memo } from "react";
import { Box, Button, TextField } from "@mui/material";
import { minMax } from "util/changeOperator";
import { KeyboardArrowDownSharp, KeyboardArrowUpSharp, KeyboardDoubleArrowLeftSharp, KeyboardDoubleArrowRightSharp } from "@mui/icons-material";

interface Props {
  value?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (level: number) => void;
}
const SelectLevel = memo((props: Props) => {
  const { value: level = 1, min: minLevel = 1, max: maxLevel = 30, disabled, onChange } = props;

  const [levelField, setLevelField] = React.useState<string>(level.toString());

  function updateLevel(lvl: string | number) {
    let parsedLevel = null;
    if (typeof lvl === "number") {
      parsedLevel = minMax(minLevel, lvl, maxLevel)
    }
    else if (parseInt(lvl, 10)) {
      parsedLevel = minMax(minLevel, parseInt(lvl, 10), maxLevel);
    }
    else {
      setLevelField("");
      return;
    }

    onChange(parsedLevel);
    setLevelField(parsedLevel.toString());
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowUp":
        updateLevel(level + 1);
        break;
      case "ArrowDown":
        updateLevel(level - 1);
        break;
      case "ArrowRight":
        updateLevel(level + 10);
        break;
      case "ArrowLeft":
        updateLevel(level - 10);
        break;
      case "Home":
        updateLevel(minLevel);
        break;
      case "End":
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
    <Box sx={{
      width: "100%",
      height: "min-content",
      display: "flex",
      flexWrap: { xs: "wrap", sm: "nowrap" },
      alignItems: "center",
      gap: 2,
    }}>
      <Box sx={{
        flexGrow: 1,
        height: "min-content",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        "& .MuiButton-root": {
          p: 0
        }
      }}>
        <Button sx={{ flexGrow: 1 }}
          onClick={() => updateLevel(level - 10)}
          disabled={disableDown}
        >
          <KeyboardDoubleArrowLeftSharp fontSize="large" />
        </Button>
        <Box sx={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "4px",
          "& .MuiButton-root": {
            display: "flex",
            p: 0,
            height: "32px",
          }
        }}>
          <Button
            onClick={() => updateLevel(level - 1)}
            disabled={disableDown}
          >
            <KeyboardArrowDownSharp fontSize="large" />
          </Button>
          <TextField
            variant="outlined"
            size="small"
            margin="none"
            // Show level if op is owned and level is not deleted 
            value={disabled || levelField ? level : ""}
            error={levelField === ""}
            onChange={(e) => updateLevel(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              gridArea: "1 / 1",
              width: "56px",
              height: "48px",
              '& .MuiInputBase-root': {
                height: "100%",
                fontSize: "1.5rem",
              },
              '& .MuiInputBase-input': {
                textAlign: "center",
              }
            }}
            onFocus={handleFocus}
            disabled={disabled}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
          />
          <Button
            onClick={() => updateLevel(level + 1)}
            disabled={disableUp}
          >
            <KeyboardArrowUpSharp fontSize="large" />
          </Button>
        </Box>
        <Button sx={{ flexGrow: 1 }}
          onClick={() => updateLevel(level === 0 ? 10 : level + 10)}
          disabled={disableUp}
        >
          <KeyboardDoubleArrowRightSharp fontSize="large" />
        </Button>
      </Box>
      <Box sx={{ flexBasis: { xs: "100%", sm: "auto" }, height: { xs: "48px", sm: "100%" }, display: "flex", flexDirection: { xs: "row", sm: "column" }, gap: 1 }}>
        <Button sx={{ flexGrow: 1 }}
          onClick={() => updateLevel(maxLevel)}
          disabled={disableUp}
        >
          Max
        </Button>
        <Button sx={{ flexGrow: 1 }}
          onClick={() => updateLevel(minLevel)}
          disabled={disableDown}
        >
          Min
        </Button>
      </Box>
    </Box>
  )
})
Level.displayName = "Level";
export default SelectLevel;