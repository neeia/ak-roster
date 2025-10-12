import { Box, BoxProps } from "@mui/material";
import clsx from "clsx";

type Orientation = "vertical" | "horizontal";

export interface CompletionIndicatorProps extends BoxProps {
  completable: boolean;
  completableByCrafting: boolean;
  requirementsNotMet?: boolean;
  orientation?: Orientation;
}

export function CompletionIndicator({
  completable,
  completableByCrafting,
  requirementsNotMet = false,
  orientation = "vertical",
  children,
  className,
  ...props
}: CompletionIndicatorProps) {
  const status =
    completable
      ? "completable"
      : (completableByCrafting && !completable)
        ? "craftable"
        : "none";
  const backgroundColor =
    status === "completable"
      ? "success.main"
      : status === "craftable"
        ? "warning.main"
        : "transparent"
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
            backgroundColor,
            zIndex: 1,
          },
          ...(requirementsNotMet && (completable || completableByCrafting) && {
            "&:after": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "35%",
              width: "2px",
              height: "30%",
              backgroundColor: "error.main",
              zIndex: 2,
            },
          }),
        }),
        ...(orientation === "horizontal" && {
          "&:after": {
            content: '""',
            position: "absolute",
            left: 0,
            bottom: 0,
            height: "2px",
            width: "70%",
            backgroundColor,
          },
        }),
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
}