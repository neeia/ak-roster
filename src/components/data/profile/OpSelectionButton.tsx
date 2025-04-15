import React from "react";
import { Button } from "@mui/material";
import { OpInfo } from "types/operators/operator";
import { ChangeCircle, PersonAddAlt1 } from "@mui/icons-material";
import Image from "components/base/Image";
import getAvatar from "util/fns/getAvatar";

interface Props {
  op?: OpInfo;
  onClick: () => void;
}

// used in support / assistant selection
const OpSelectionButton = (props: Props) => {
  const { op, onClick } = props;

  return (
    <Button
      sx={{
        position: "relative",
        height: 96,
        aspectRatio: "1 / 1",
        backgroundColor: "background.light",
        "&:hover": {
          filter: "brightness(1.04)",
          "& img": {
            transform: "scale(1.04)",
            filter: "brightness(0.96)",
          },
        },
      }}
      onClick={onClick}
    >
      {op ? (
        <>
          <Image
            src={getAvatar(op)}
            alt={op.name}
            sx={{
              width: 96,
              height: 96,
              transition: "transform 0.05s",
            }}
          />
          <ChangeCircle
            fontSize="large"
            aria-label="Select Operator"
            sx={{
              position: "absolute",
              bottom: -8,
              left: -8,
              backgroundColor: "background.default",
              borderRadius: "50%",
            }}
          />
        </>
      ) : (
        <PersonAddAlt1 />
      )}
    </Button>
  );
};
export default OpSelectionButton;
