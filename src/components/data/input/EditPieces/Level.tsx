import React from "react";
import { Operator } from "types/operator";
import { Box, Button, TextField } from "@mui/material";
import { changeLevel, MAX_LEVEL_BY_RARITY } from "util/changeOperator";
import { KeyboardArrowDownSharp, KeyboardArrowUpSharp, KeyboardDoubleArrowLeftSharp, KeyboardDoubleArrowRightSharp } from "@mui/icons-material";
import operatorJson from "data/operators";

interface Props {
  level?: number;
  minLevel?: number;
  eliteLevel?: number;
  operatorRarity?: number;
  onChange: (level: number) => void;
}
const Level = (props: Props) => {
  const { level, minLevel, eliteLevel, operatorRarity, onChange } = props;

  const [levelField, setLevelField] = React.useState<string>(level?.toString() ?? "1");

  function updateLevel(lvl: string | number) {
    if (typeof lvl === "number") {
      let parsedLevel = Math.max(Math.min(lvl, MAX_LEVEL_BY_RARITY[operatorRarity ?? 0][eliteLevel ?? 0]), 1)
      parsedLevel = Math.max(parsedLevel, minLevel!);
      onChange(parsedLevel);
      setLevelField(parsedLevel.toString());
    }
    else if (parseInt(lvl, 10)) {
      let parsedLevel = Math.max(Math.min(parseInt(lvl, 10), MAX_LEVEL_BY_RARITY[operatorRarity ?? 0][eliteLevel ?? 0]), 1)
      parsedLevel = Math.max(parsedLevel, minLevel!);
      onChange(parsedLevel);
      setLevelField(parsedLevel.toString());
    }
    else {
      setLevelField("");
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  const disableM = !level || level === 1 || level === minLevel;

  const disableP = !level || level >= MAX_LEVEL_BY_RARITY[operatorRarity ?? 0][eliteLevel ?? 0];

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "1fr repeat(3, auto) 1fr",
      alignItems: "center",
      gap: "4px",
      "& .MuiButton-root": {
        display: "grid",
        p: 0.5,
        minWidth: 0,
        lineHeight: 0.5,
        color: "#ffffff",
        height: "56px",
      }
    }}>

      <Button
        onClick={() => updateLevel(1)}
        disabled={disableM}
      >
        Min
      </Button>
      <Button
        onClick={() => updateLevel(level! - 10)}
        disabled={disableM}
      >
        <KeyboardDoubleArrowLeftSharp fontSize="large" />
      </Button>
      <Box sx={{
        display: "flex",
        flexDirection: "column-reverse",
        gap: "2px",
        "& .MuiButton-root": {
          display: "grid",
          p: 0,
          height: "min-content",
        }
      }}>
        <Button
          onClick={() => updateLevel(level! - 1)}
          disabled={disableM}
        >
          <KeyboardArrowDownSharp fontSize="large" />
        </Button>
        <Box sx={{ display: "grid" }}>
          <TextField
            variant="outlined"
            size="small"
            margin="none"
            // Show level if op is owned and level is not deleted 
            value={level && levelField ? level : ""}
            error={levelField === ""}
            onChange={(e) => updateLevel(e.target.value)}
            sx={{
              width: "56px",
              gridArea: "1 / 1",
              '& .MuiInputBase-input': {
                py: "0.5rem",
                fontSize: "1.5rem",
                textAlign: "center",
              }
            }}
            onFocus={handleFocus}
            disabled={!level}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
          />
        </Box>
        <Button
          onClick={() => updateLevel(level! + 1)}
          disabled={disableP}
        >
          <KeyboardArrowUpSharp fontSize="large" />
        </Button>
      </Box>
      <Button
        onClick={() => updateLevel(!(level! - 1) ? 10 : level! + 10)}
        disabled={disableP}
      >
        <KeyboardDoubleArrowRightSharp fontSize="large" />
      </Button>
      <Button
        onClick={() => updateLevel(MAX_LEVEL_BY_RARITY[operatorRarity ?? 0][eliteLevel ?? 0])}
        disabled={disableP}
      >
        Max
      </Button>
    </Box>
  )
}
export default Level;