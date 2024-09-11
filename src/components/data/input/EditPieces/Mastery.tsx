import React from "react";
import { Operator, OperatorData } from "types/operator";
import { Box, Button, Typography } from "@mui/material";
import operatorJson from "data/operators";
import { changeMastery } from "util/changeOperator";
import Image from "next/image";

interface Props {
  op: Operator;
  onChange: (newOperator: Operator) => void;
}
const Mastery = ((props: Props) => {
  const { op, onChange } = props;
  const opData = operatorJson[op.op_id];

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
      {[...Array(opData.skillData.length)].map((_, i) => {
        const disabled = !op.potential || op.skill_level < 7 || op.elite < 2;
        return (
          <Box
            key={`maB${i}`}
            sx={{
              display: "grid",
              width: "max-content",
              gap: "0rem 1rem",
              gridTemplateAreas: `"icon name name name name"
                      "icon m m m m"`,
              gridTemplateColumns: "auto repeat(4, 1fr)",
              gridTemplateRows: "auto 1fr",
              justifyItems: "center",
              alignItems: "center",
            }}>
            <Typography
              variant="caption2"
              sx={{
                gridArea: "name",
                fontWeight: 100,
                mb: -0.25,
                zIndex: 1
              }}>
              {opData.skillData[i].skillName}
            </Typography>
            {opData !== undefined
              ? <Box
                component="img"
                className={op.elite < i ? "Mui-disabled" : ""}
                sx={{ gridArea: "icon" }}
                width="48px"
                src={`/img/skills/${opData.skillData[i].iconId ?? opData.skillData[i].skillId}.png`}
                alt={`Skill ${i + 1}`}
              />
              : ""}
            {[...Array(4)].map((_, j) =>
              <Button
                className={!disabled && (op.masteries && op.masteries[i] ? op.masteries[i] === j : j === 0) ? "active" : "inactive"}
                key={`mastery${j}Button`}
                sx={{
                  gridRow: 2,
                  gridColumn: j + 2,
                  display: "grid",
                  "& > *": { gridArea: "1 / 1" },
                  p: 0.5,
                  minWidth: 0,
                  height: "40px",
                }}
                onClick={() => onChange(changeMastery(op, i, j))}
                disabled={disabled}
              >
                <Image
                  width={32}
                  height={32}
                  src={`/img/rank/bg.png`}
                  alt={""}
                />
                <Image
                  width={32}
                  height={32}
                  src={`/img/rank/m-${j}.png`}
                  alt={`Mastery ${j}`}
                />
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  )
})
export default Mastery;