import React from "react";
import { Operator } from "../../../types/operator";
import { Box, Button, Typography } from "@mui/material";
import { changeMastery } from "../../../util/changeOperator";

interface Props {
  op: Operator;
  onChange: (newOperator: Operator) => void;
}
const Mastery = (props: Props) => {
  const { op, onChange } = props;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {[...Array(3)].map((_, i) => {
        const disabled = !op.potential || op.skill_level < 7 || op.elite < 2;
        return (
          <Box
            key={`maB${i}`}
            sx={{
              display: "grid",
              width: "max-content",
              gap: "0rem 1rem",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "auto 1fr",
              justifyItems: "center",
              alignItems: "center",
            }}
          >
            <Typography
              variant="caption2"
              sx={{
                gridColumn: "span 4",
                fontWeight: 100,
                mb: -0.25,
                zIndex: 1,
              }}
            >
              Skill {i + 1}
            </Typography>
            {[...Array(4)].map((_, j) => (
              <Button
                className={
                  !disabled &&
                  (op.masteries && op.masteries[i]
                    ? op.masteries[i] === j
                    : j === 0)
                    ? "active"
                    : "inactive"
                }
                key={`mastery${j}Button`}
                sx={{
                  display: "grid",
                  "& > *": { gridArea: "1 / 1" },
                  p: 0.5,
                  minWidth: 0,
                }}
                onClick={() => onChange(changeMastery(op, i, j))}
                disabled={disabled}
              >
                <Box
                  component="img"
                  width="32px"
                  src={`/img/rank/bg.png`}
                  alt={""}
                />
                <Box
                  component="img"
                  width="32px"
                  src={`/img/rank/m-${j}.png`}
                  alt={`Mastery ${j}`}
                />
              </Button>
            ))}
          </Box>
        );
      })}
    </Box>
  );
};
export default Mastery;
