import React from "react";
import { Operator } from "../../../types/operator";
import { Box, Button, TextField } from "@mui/material";
import { changeLevel, MAX_LEVEL_BY_RARITY } from "../../../util/changeOperator";
import { HorizontalRule, KeyboardArrowDownSharp, KeyboardArrowUpSharp, KeyboardDoubleArrowLeftSharp, KeyboardDoubleArrowRightSharp } from "@mui/icons-material";

interface Props {
  op: Operator;
  onChange: (operatorID: string, newOperator: Operator) => void;
}
const Level = (props: Props) => {
  const { op, onChange } = props;

  const [levelField, setLevelField] = React.useState<string>(op.level.toString());
  function updateLevel(lvl: string | number) {
    if (typeof lvl === "number") {
      onChange(op.id, changeLevel(op, lvl));
      setLevelField(Math.max(Math.min(lvl, MAX_LEVEL_BY_RARITY[op.rarity][op.promotion]), 1).toString());
    }
    else if (parseInt(lvl)) {
      onChange(op.id, changeLevel(op, parseInt(lvl)));
      setLevelField(Math.max(Math.min(parseInt(lvl), MAX_LEVEL_BY_RARITY[op.rarity][op.promotion]), 1).toString());
    }
    else {
      setLevelField("");
    }
  };
  const min = (
    <Button
      onClick={() => updateLevel(1)}
      disabled={!op.owned || op.level === 1}
    >
      Min
    </Button>
  );
  const m10 = (
    <Button
      onClick={() => updateLevel(op.level - 10)}
      disabled={!op.owned || op.level === 1}
    >
      <KeyboardDoubleArrowLeftSharp fontSize="large" />
    </Button>
  );
  const m1 = (
    <Button
      onClick={() => updateLevel(op.level - 1)}
      disabled={!op.owned || op.level === 1}
    >
      <KeyboardArrowDownSharp fontSize="large" />
    </Button>
  );
  const p1 = (
    <Button
      onClick={() => updateLevel(op.level + 1)}
      disabled={!op.owned || op.level >= MAX_LEVEL_BY_RARITY[op.rarity][op.promotion]}
    >
      <KeyboardArrowUpSharp fontSize="large" />
    </Button>
  );
  const p10 = (
    <Button
      onClick={() => updateLevel(op.level + 10)}
      disabled={!op.owned || op.level >= MAX_LEVEL_BY_RARITY[op.rarity][op.promotion]}
    >
      <KeyboardDoubleArrowRightSharp fontSize="large" />
    </Button>
  );
  const max = (
    <Button
      onClick={() => updateLevel(MAX_LEVEL_BY_RARITY[op.rarity][op.promotion])}
      disabled={!op.owned || op.level >= MAX_LEVEL_BY_RARITY[op.rarity][op.promotion]}
    >
      Max
    </Button>
  );

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
      {min}
      {m10}
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
        {m1}
        <Box sx={{ display: "grid", }}><TextField
          variant="outlined"
          size="small"
          margin="none"
          value={op.owned ? (levelField === "" ? levelField : op.level) : ""}
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
          disabled={!op.owned}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*'
          }}
        />
          {op.owned ? ""
            : <HorizontalRule
              className={"Mui-disabled"}
              sx={{
                gridArea: "1 / 1",
                width: "100%",
                alignSelf: "center"
              }}
            />}
        </Box>
        {p1}
      </Box>
      {p10}
      {max}
    </Box>
  )
}
export default Level;