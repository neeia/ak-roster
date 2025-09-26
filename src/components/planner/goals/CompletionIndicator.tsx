import { Box, BoxProps } from "@mui/material";
import clsx from "clsx";

type Orientation = "vertical" | "horizontal";

interface CompletionIndicatorProps extends BoxProps {
  completable: boolean;
  completableByCrafting: boolean;
  orientation?: Orientation; 
}

export function CompletionIndicator({
  completable,
  completableByCrafting,
  orientation = "vertical",
  children,
  className,
  ...props
}: CompletionIndicatorProps) {
  const status = completable ? "completable" : (completableByCrafting && !completable) ? "craftable" : "none";
  return (
    <Box
      {...props}
      className={clsx(className, {
        completable: completable,
        craftable: completableByCrafting && !completable,
      })}
      sx={{
        position: "relative",
        ...(orientation === "vertical" && {
          "&:before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "2px",
            height: "100%",
            backgroundColor:
              status === "completable"
                ? "success.main"
                : status === "craftable"
                ? "warning.main"
                : "transparent",
          },
        }),
        ...(orientation === "horizontal" && {
          "&:after": {
            content: '""',
            position: "absolute",
            left: 0,
            bottom: 0,
            height: "2px",
            width: "70%",
            backgroundColor:
              status === "completable"
                ? "success.main"
                : status === "craftable"
                ? "warning.main"
                : "transparent",
          },
        }),
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
}