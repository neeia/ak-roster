import React, { useContext } from "react";
import { Skin } from "types/operators/operator";
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, ToggleButtonProps, Tooltip } from "@mui/material";
import Image from "next/image";
import { DisabledContext } from "./SelectGroup";
import attachSubComponents from "util/subcomponent";

interface Props extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value: string | null;
  onChange: (value: string) => void;
}
const Skins = (props: Props) => {
  const { value, onChange, disabled: _disabled = false, sx, children, ...rest } = props;

  const disabled = useContext(DisabledContext) || _disabled;

  return (
    <ToggleButtonGroup
      value={value}
      aria-label="Skins"
      onChange={(_, i) => onChange(i)}
      disabled={disabled}
      sx={{
        display: "flex",
        borderRadius: 1,
        flexWrap: "wrap",
        gap: 1,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </ToggleButtonGroup>
  );
};

interface SelectProps extends Skin, Omit<ToggleButtonProps, "value" | "size"> {
  size?: number;
}
const Select = (props: SelectProps) => {
  const { skinName, skinId, sortId, avatarId, disabled: _disabled = false, sx, size = 48, ...rest } = props;

  return (
    // <Tooltip title={skinName ?? `Default Elite ${sortId + 3}`} arrow describeChild>
    <ToggleButton
      value={avatarId}
      sx={{
        p: 1,
        "&:not(._):not(._)": {
          borderRadius: 1,
        },
        ...sx,
      }}
      disabled={_disabled}
      {...rest}
    >
      <Image src={`/img/avatars/${avatarId.replace("#", "%23")}.png`} width={size} height={size} alt={""} />
    </ToggleButton>
    // </Tooltip>
  );
};

const _Skins = attachSubComponents("Skins", Skins, { Select });
export default _Skins;
