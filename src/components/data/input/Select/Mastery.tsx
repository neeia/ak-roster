import React, { memo, useContext } from "react";
import {
  Box,
  BoxProps,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
  Typography,
} from "@mui/material";
import Image from "next/image";
import attachSubComponents from "util/subcomponent";
import { DisabledContext } from "./SelectGroup";

interface Props extends BoxProps<"ol"> {
  children?: React.ReactNode;
}
const Mastery = memo((props: Props) => {
  const { children, sx, ...rest } = props;

  return (
    <Box
      component="ol"
      sx={{
        width: "100%",
        m: 0,
        p: 0,
        py: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
});

interface SkillProps {
  src?: string;
  skillNumber?: number;
  skillName?: string;
  children?: React.ReactNode;
}
const Skill = (props: SkillProps) => {
  const {
    src,
    skillNumber,
    skillName = "Missing Skill Data",
    children,
  } = props;
  const size = 48;

  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {src && (
          <Image
            src={`/img/skills/${src}.png`}
            alt=""
            width={size}
            height={size}
          />
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
          }}
        >
          {skillNumber !== null && (
            <Typography variant="h4" component="span" sx={{ m: 0 }}>
              Skill {skillNumber}
            </Typography>
          )}
          <Typography>{skillName}</Typography>
        </Box>
      </Box>
      {children}
    </Box>
  );
};

interface SelectProps
  extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  onChange: (value: number) => void;
}
const Select = (props: SelectProps) => {
  const {
    value,
    min = 0,
    max = 3,
    onChange,
    disabled: _disabled = false,
    sx,
    size = 32,
    ...rest
  } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_, i) => {
        if (i != null) onChange(i);
      }}
      disabled={disabled}
      sx={{
        height: "min-content",
        width: "min-content",
        display: "flex",
        justifyContent: "center",
        borderRadius: 1,
        ...sx,
      }}
      {...rest}
    >
      {[...Array(4)].map((_, i) => (
        <ToggleButton key={i} value={i} sx={{ p: 1 }}>
          <Image
            src={`/img/rank/m-${i}.png`}
            alt={`Mastery ${i}`}
            width={size}
            height={size}
          />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

const _Mastery = attachSubComponents("Mastery", Mastery, { Skill, Select });
export default _Mastery;
