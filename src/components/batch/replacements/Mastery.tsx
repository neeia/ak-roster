import React from "react";
import { Operator, OpJsonObj } from "../../../types/operator";
import { Box, Button, Typography } from "@mui/material";

interface Props {
  op: Operator;
  onChange: (
    operatorId: string,
    property: string,
    value: number,
    index: number
  ) => void;
}
const Mastery = ((props: Props) => {
  const { op, onChange } = props;

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "4px",
    }}>
      {[...Array(3)].map((_, i) => {
        const disabled = !op.owned || op.skillLevel < 7 || op.promotion < 2;
        return (
          <Box
            key={`maB${i}`}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "auto 1fr",
              justifyItems: "center",
              alignItems: "center",
            }}>
            <Typography
              variant="caption2"
              sx={{
                gridColumn: "span 4",
                fontWeight: 100,
                mb: -0.25,
                zIndex: 1
              }}>
              Skill {i}
            </Typography>
            {[...Array(4)].map((_, j) =>
              <Button
                className={!disabled && (op.mastery && op.mastery[i] ? op.mastery[i] === j : j === 0) ? "active" : "inactive"}
                key={`mastery${j}Button`}
                sx={{
                  display: "grid",
                  "& > *": { gridArea: "1 / 1" },
                  p: 0.5,
                  minWidth: 0,
                }}
                onClick={() => onChange(op.id, "mastery", j, i)}
                disabled={disabled}
              >
                <Box component="img"
                  width="32px"
                  src={`/img/rank/bg.png`}
                  alt={""}
                />
                <Box component="img"
                  width="32px"
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