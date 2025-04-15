import React, { memo, useContext } from "react";
import { Box, BoxProps, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, Typography } from "@mui/material";
import Image from "components/base/Image";
import attachSubComponents from "util/subcomponent";
import { DisabledContext } from "./SelectGroup";
import imageBase from "util/imageBase";

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

interface SkillProps extends BoxProps<"li"> {
  src?: string;
  skillNumber?: number;
  skillName?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}
function Skill(props: SkillProps) {
  const { src, skillNumber, skillName = "Missing Skill Data", children, sx, ...rest } = props;
  const size = 48;

  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        ...sx,
      }}
      {...rest}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {src && <Image src={`${imageBase}/skills/${src}.webp`} alt="" width={size} height={size} />}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
          }}
        >
          {skillNumber !== undefined && (
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
}

function SkillAlt(props: SkillProps) {
  const { src, skillNumber, skillName = "Missing Skill Data", disabled = false, children, sx, ...rest } = props;
  const size = 48;

  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: "100%",
        ...sx,
      }}
      {...rest}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "baseline",
          opacity: disabled ? 0.25 : 1,
        }}
      >
        {skillNumber !== undefined && (
          <Typography variant="h3" component="span" sx={{ m: 0 }}>
            S{skillNumber}
          </Typography>
        )}
        <Typography>{skillName}</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {src && (
          <Image
            src={`${imageBase}/skills/${src}.webp`}
            alt=""
            width={size}
            height={size}
            style={{ opacity: disabled ? 0.25 : 1 }}
          />
        )}
        {children}
      </Box>
    </Box>
  );
}

interface SelectProps extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  onChange: (value: number) => void;
}
function Select(props: SelectProps) {
  const { value, min = 0, max = 3, onChange, disabled: _disabled = false, sx, size = 32, ...rest } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  return (
    <ToggleButtonGroup
      value={value}
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
        <ToggleButton
          key={i}
          value={i}
          sx={{ p: 1, "& img": { filter: "drop-shadow(0px 0px 0px #000)" } }}
          onClick={() => onChange(i)}
        >
          <Image src={`${imageBase}/rank/m-${i}.webp`} alt={`Mastery ${i}`} width={size} height={size} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

Mastery.displayName = "Mastery";
const _Mastery = attachSubComponents("Mastery", Mastery, { Skill, SkillAlt, Select });
export default _Mastery;
