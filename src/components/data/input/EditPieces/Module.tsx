import React, { memo } from "react";
import { Operator, ModuleData } from "types/operator";
import operatorJson from "data/operators";
import { Box, Button, Typography } from "@mui/material";
import { changeModule, MODULE_REQ_BY_RARITY } from "util/changeOperator";
import Image from "next/image";
import Mastery from "./Mastery";

interface Props {
  modules?: Record<string, number>,
  minModules? : Record<string, number>,
  opId?: string;
  opLevel? : number;
  eliteLevel? : number;
  onChange: (moduleId: string, newMasteryLevel: number) => void;
}
const Module = memo((props: Props) => {
  const {modules, minModules, opId, opLevel, eliteLevel, onChange } = props;
  const opData = opId ? operatorJson[opId] : undefined;

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
    }}>
      {opData?.moduleData?.map((module: ModuleData, moduleNumber: number) => {
        const disabled = !opId || (opLevel ?? 0) < MODULE_REQ_BY_RARITY[opData.rarity] || (eliteLevel ?? 0) < 2;
        return (
          <Box
            key={`maB${moduleNumber}`}
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
              {`${module.typeName} (${module.moduleName})`}
            </Typography>
            <Box sx={{ gridArea: "icon", display: "flex", flexDirection: "column", alignItems: "center", }}>
              <Image
                className={disabled ? "Mui-disabled" : ""}
                width={48}
                height={48}
                src={`/img/equip/${opData!.moduleData![moduleNumber].moduleId}.png`}
                alt={`Module ${moduleNumber + 1}`}
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
            {[...Array(4)].map((_, moduleLevel) =>
              <Button
                className={moduleLevel === (modules && modules[module.moduleId] ? modules[module.moduleId] :  0) ? "active" : "inactive"}
                key={`mod${moduleLevel}Button`}
                sx={{
                  gridRow: 2,
                  gridColumn: moduleLevel + 2,
                  display: "grid",
                  p: 0.5,
                  minWidth: 0,
                  backgroundColor: "background.default",
                  height: "40px",
                }}
                onClick={() => onChange(opData!.moduleData![moduleNumber].moduleId, moduleLevel)}
                disabled={disabled || moduleLevel < (minModules ? minModules[module.moduleId] : 0)}
              >
                <Image
                  width={32}
                  height={32}
                  src={`/img/equip/img_stg${moduleLevel}.png`}
                  alt={`Module ${moduleLevel}`}
                />
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  )
})
Module.displayName = "Module";
export default Module;