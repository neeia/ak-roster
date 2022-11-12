import React from "react";
import { Operator } from "types/operator";
import { Box, Button } from "@mui/material";
import { KeyboardArrowDownSharp, KeyboardArrowUpSharp } from "@mui/icons-material";
import { changeSkillLevel } from "util/changeOperator";
import Image from "next/image";

interface Props {
  op: Operator;
  onChange: (newOperator: Operator) => void;
}
const SkillLevel = (props: Props) => {
  const { op, onChange } = props;

  const previousSkillLevel = op.skillLevel > 4 ? 4 : 1;
  const nextSkillLevel = op.skillLevel < 4 ? 4 : 7;

  function updateRank(rank: number) {
    onChange(changeSkillLevel(op, rank));
  };

  const rankButton = (rank: number) => (
    <Button
      aria-label={`Skill Rank to ${rank}`}
      onClick={() => updateRank(rank)}
      disabled={!op.owned || op.skillLevel === rank || rank > [4, 7, 7][op.promotion]}
    >
      <Box
        sx={{ gridArea: "1 / 1" }}
        component="img"
        width="2.5rem"
        src={`/img/rank/bg.png`}
        alt={""}
      />
      <Box
        sx={{ gridArea: "1 / 1" }}
        component="img"
        width="2.5rem"
        src={`/img/rank/${rank}.png`}
        alt={`Rank ${rank}`}
      />
    </Button>
  );

  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      gap: "4px",
      "& .MuiButton-root": {
        display: "grid",
        p: 0.5,
        minWidth: 0,
        lineHeight: 0.5,
        color: "#ffffff",
      }
    }}>
      {rankButton(previousSkillLevel)}
      <Box sx={{
        display: "flex",
        flexDirection: "column-reverse",
        gap: "2px",
        "& > .MuiButton-root": {
          display: "grid",
          p: 0,
          height: "min-content",
        }
      }}>
        <Button
          aria-label="Lower Skill Rank"
          sx={{ display: { xs: "none", sm: "" }, }}
          onClick={() => updateRank(op.skillLevel - 1)}
          disabled={!op.owned || op.skillLevel === 1}
        >
          <KeyboardArrowDownSharp fontSize="large" />
        </Button>
        <Box sx={{ display: "grid", "& > *": { gridArea: "1 / 1", width: "3.75rem" } }}>
          <Box
            component="img"
            src={`/img/rank/bg.png`}
            alt={""}
          />
          {op.owned
            ? <Box
              component="img"
              src={`/img/rank/${op.skillLevel}.png`}
              alt={`Rank ${op.skillLevel}`}
            />
            : null}
        </Box>
        <Button
          aria-label="Raise Skill Rank"
          sx={{ display: { xs: "none", sm: "" }, }}
          onClick={() => updateRank(op.skillLevel + 1)}
          disabled={!op.owned || op.skillLevel === [4, 7, 7][op.promotion]}
        >
          <KeyboardArrowUpSharp fontSize="large" />
        </Button>
      </Box>
      {rankButton(nextSkillLevel)}
    </Box>
  )
}
export default SkillLevel;