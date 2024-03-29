import React from "react";
import { Operator, OpJsonModule, OpJsonObj } from "../../../types/operator";
import operatorJson from "../../../data/operators.json";
import { Box, Button, Typography } from "@mui/material";
import { changeModule, MODULE_REQ_BY_RARITY } from "../../../util/changeOperator";
import Image from "next/image";

interface Props {
  op: Operator;
  onChange: (newOperator: Operator) => void;
}
const Module = ((props: Props) => {
  const { op, onChange } = props;
  const opInfo: OpJsonObj = operatorJson[op.id as keyof typeof operatorJson];

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
      {opInfo.modules.map((module: OpJsonModule, i: number) => {
        const disabled = !op.owned || op.level < MODULE_REQ_BY_RARITY[op.rarity] || op.promotion < 2;
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
                textAlign: "center",
                gridArea: "name",
                zIndex: 1,
                width: "fit-content",
                maxWidth: "16rem",
                lineHeight: "1.1",
                overflowWrap: "break-word",
              }}>
              {module.moduleName}
            </Typography>
            <Box sx={{ gridArea: "icon", display: "flex", flexDirection: "column", alignItems: "center", }}>
              <Image
                className={disabled ? "Mui-disabled" : ""}
                width="48px"
                height="48px"
                src={`/img/equip/${opInfo.modules[i].typeName.toLowerCase()}.png`}
                alt={`Module ${i + 1}`}
              />
              <Typography
                variant="caption3"
                sx={{
                  mb: -0.25,
                  zIndex: 1
                }}>
                {module.typeName}
              </Typography>
            </Box>
            {[...Array(4)].map((_, j) =>
              <Button
                className={!disabled && (op.module && op.module[i] ? op.module[i] === j : j === 0) ? "active" : "inactive"}
                key={`mod${j}Button`}
                sx={{
                  gridRow: 2,
                  gridColumn: j + 2,
                  display: "grid",
                  p: 0.5,
                  minWidth: 0,
                  backgroundColor: "background.default",
                }}
                onClick={() => onChange(changeModule(op, i, j))}
                disabled={disabled}
              >
                <Image
                  width="32px"
                  height="32px"
                  src={`/img/equip/img_stg${j}.png`}
                  alt={`Module ${j}`}
                />
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  )
})
export default Module;