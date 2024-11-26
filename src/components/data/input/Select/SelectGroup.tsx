import { Box, BoxProps, Button, SxProps, Theme, Typography } from "@mui/material";
import React, { createContext, useCallback, useContext, useEffect, useRef } from "react";
import findFirstFocusableElement from "util/findFirstFocusableElement";
import attachSubComponents from "util/subcomponent";

export const DisabledContext = createContext(false);

interface Props extends Omit<BoxProps, "onClick"> {
  title?: string;
  label?: string;
  onClick?: () => void;
  nobg?: boolean;
}

const SelectGroup = (props: Props) => {
  const { title, label, children, onClick, sx, nobg = false, ...rest } = props;

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: nobg ? "transparent" : "background.default",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        gap: 1,
        p: 2,
        ...sx,
      }}
      {...rest}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="h3">{title}</Typography>
        {label && (
          <Button
            variant="text"
            onClick={onClick}
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              p: 0,
            }}
          >
            {label}
          </Button>
        )}
      </Box>
      {children}
    </Box>
  );
};

interface AddGroupProps extends Props {
  open?: boolean;
  toggleOpen?: () => void;
  disabled?: boolean;
}
const Toggle = (props: AddGroupProps) => {
  const {
    open = false,
    label = "Remove",
    onClick: _onClick,
    toggleOpen,
    disabled: _disabled = false,
    id: _id,
    ...rest
  } = props;
  const disabled = useContext(DisabledContext);

  const id = _id ?? `sel-group-${props.title}`;
  const el = useRef<HTMLElement>(null);

  const onClick = useCallback(() => {
    toggleOpen?.();
    if (open) {
      _onClick?.();
    }
  }, [_onClick, toggleOpen, open]);

  useEffect(() => {
    if (!el.current) return;
    const e = findFirstFocusableElement(el.current);
    if (e) (e as HTMLElement).focus();
  }, [el]);

  useEffect(() => {
    if (disabled) _onClick?.();
  }, [disabled]);

  return open ? (
    <Box sx={{ display: "contents" }} ref={el}>
      <SelectGroup id={id} label={label} onClick={onClick} {...rest} />
    </Box>
  ) : (
    <Button
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: "100%",
        height: "64px",
        backgroundColor: "background.default",
        color: "text.secondary",
      }}
    >
      + {props.title}
    </Button>
  );
};

interface FromToProps extends BoxProps {
  children: [React.ReactNode, React.ReactNode];
}
const FromTo = (props: FromToProps) => {
  const { children, sx: _sx, ...rest } = props;

  const sx: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    ..._sx,
  };

  return (
    <Box
      sx={{
        display: "grid",
        width: "100%",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
        },
        gap: 2,
      }}
    >
      <Box sx={sx} {...rest}>
        <Typography variant="h4">FROM</Typography>
        {children[0]}
      </Box>
      <Box sx={sx} {...rest}>
        <Typography variant="h4">TO</Typography>
        {children[1]}
      </Box>
    </Box>
  );
};

const Select = attachSubComponents("SelectGroup", SelectGroup, {
  Toggle,
  FromTo,
});

export default Select;
