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

  const previousSkillLevel = op.skill_level > 4 ? 4 : 1;
  const nextSkillLevel = op.skill_level < 4 ? 4 : 7;

  function updateRank(rank: number) {
    onChange(changeSkillLevel(op, rank));
  };

  const rankButton = (rank: number) => (
    <Button
      aria-label={`Skill Rank to ${rank}`}
      onClick={() => updateRank(rank)}
      disabled={!op.potential || op.skill_level === rank || rank > [4, 7, 7][op.elite]}
    >
      <Box
        sx={{
          width: "40px",
          height: "40px",
          position: "relative",
        }}
      >
        <Image
          src="/img/rank/bg.png"
          fill
          sizes="40px"
          alt=""
        />
        <Image
          src={`/img/rank/${rank}.png`}
          fill
          sizes="40px"
          alt={`Rank ${rank}`}
        />
      </Box>
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
          onClick={() => updateRank(op.skill_level - 1)}
          disabled={!op.potential || op.skill_level === 1}
        >
          <KeyboardArrowDownSharp fontSize="large" />
        </Button>
        <Box sx={{
          display: "grid",
          width: "64px",
          height: "64px",
          position: "relative",
        }}>
          <Image
            src={`/img/rank/bg.png`}
            fill
            sizes="64px"
            alt={""}
          />
          {op.potential
            ? <Image
              src={`/img/rank/${op.skill_level}.png`}
              fill
              sizes="64px"
              alt={`Rank ${op.skill_level}`}
            />
            : null}
        </Box>
        <Button
          aria-label="Raise Skill Rank"
          sx={{ display: { xs: "none", sm: "" }, }}
          onClick={() => updateRank(op.skill_level + 1)}
          disabled={!op.potential || op.skill_level === [4, 7, 7][op.elite]}
        >
          <KeyboardArrowUpSharp fontSize="large" />
        </Button>
      </Box>
      {rankButton(nextSkillLevel)}
    </Box>
  )
}
export default SkillLevel;