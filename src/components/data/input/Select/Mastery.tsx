import React, { memo } from "react";
import { Box, BoxProps, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, Typography } from "@mui/material";
import Image from "next/image";
import attachSubComponents from "util/subcomponent";

interface Props extends BoxProps {
  children?: React.ReactNode;
}
const Mastery = memo((props: Props) => {
  const { children, sx, ...rest } = props;

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      ...sx
    }} {...rest}>
      {children}
    </Box>
  )
})

interface SkillProps {
  src?: string;
  skillNumber?: number;
  skillName?: string;
  children?: React.ReactNode;
}
const Skill = (props: SkillProps) => {
  const { src, skillNumber, skillName = "Missing Skill Data" } = props;


  return (
    <Box sx={{
      display: "flex",
      gap: 2,
    }}>
      {src && <Box
        component="img"
        sx={{ gridArea: "icon" }}
        width="48px"
        src={`/img/skills/${src}.png`}
        alt={skillNumber == null ? "" : `Skill ${skillNumber}`}
      />
      }
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography
          variant="caption2"
          sx={{
            gridArea: "name",
            fontWeight: 100,
            mb: -0.25,
            zIndex: 1
          }}>
          {skillName}
        </Typography>
      </Box>
    </Box>
  )
}

interface SelectProps extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value: number,
  min?: number,
  max?: number;
  size?: number;
  onChange: (value: number) => void;
}
const Select = (props: SelectProps) => {
  const { value, min = 0, max = 3, onChange, disabled = false, sx, size = 32, ...rest } = props;

  return (
    <ToggleButtonGroup exclusive value={value}
      onChange={(_, i) => onChange(i)}
      disabled={disabled}
      sx={{
        height: "min-content",
        width: "min-content",
        display: "flex",
        justifyContent: "center",
        borderRadius: 1,
        ...sx
      }}
      {...rest}
    >
      {[...Array(4)].map((_, i) => (
        <ToggleButton key={i} value={i}>
          <Image
            width={size}
            height={size}
            src={`/img/rank/m-${i}.png`}
            alt={`Mastery ${i}`}
          />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

attachSubComponents("Mastery", Mastery, { Select, Skill });
export default Mastery;