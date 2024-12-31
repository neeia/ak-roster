import React, { memo, useContext } from "react";
import { ModuleData } from "types/operators/operator";
import { Box, BoxProps, ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps, Typography } from "@mui/material";
import Image from "next/image";
import attachSubComponents from "util/subcomponent";
import { DisabledContext } from "./SelectGroup";

interface Props extends BoxProps<"ol"> {}
const Module = memo((props: Props) => {
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

interface ItemProps extends Partial<Pick<ModuleData, "moduleName" | "moduleId" | "typeName">> {
  children?: React.ReactNode;
  disabled?: boolean;
}
const Item = (props: ItemProps) => {
  const { moduleId: src, typeName, moduleName = "Missing Module Data", children } = props;
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
        {src && <Image src={`/img/equip/${src}.png`} alt="" width={size} height={size} />}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
          }}
        >
          {typeName && (
            <Typography variant="h4" component="span" sx={{ m: 0 }}>
              {typeName}
            </Typography>
          )}
          <Typography>{moduleName}</Typography>
        </Box>
      </Box>
      {children}
    </Box>
  );
};
const ItemAlt = (props: ItemProps) => {
  const { moduleId: src, typeName, moduleName = "Missing Module Data", disabled = false, children } = props;
  const size = 48;

  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "baseline",
          opacity: disabled ? 0.25 : 1,
        }}
      >
        {typeName && (
          <Typography variant="h4" component="span" sx={{ m: 0 }}>
            {typeName}
          </Typography>
        )}
        <Typography>{moduleName}</Typography>
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
            src={`/img/equip/${src}.png`}
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
};

interface SelectProps extends Omit<ToggleButtonGroupProps, "onChange" | "size"> {
  value?: number;
  moduleId: string;
  min?: number;
  max?: number;
  size?: number;
  onChange: (id: string, value: number) => void;
}
const Select = (props: SelectProps) => {
  const { value, moduleId, min = 0, max = 3, onChange, disabled: _disabled = false, sx, size = 32, ...rest } = props;

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
        <ToggleButton key={i} value={i} sx={{ p: 1 }} onChange={() => onChange(moduleId, i)}>
          <Image src={`/img/equip/img_stg${i}.png`} alt={`Module ${i}`} width={size} height={size} />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

const _Module = attachSubComponents("Module", Module, { Item, ItemAlt, Select });
export default _Module;
