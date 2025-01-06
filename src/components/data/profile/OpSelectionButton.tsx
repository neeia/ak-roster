import React from "react";
import { Button } from "@mui/material";
import { OpInfo } from "types/operators/operator";
import { ChangeCircle, PersonAddAlt1 } from "@mui/icons-material";
import Image from "next/image";
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
        "& img": {
          borderRadius: "4px",
          transition: "transform 0.05s",
        },
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
          <Image src={getAvatar(op)} fill sizes="100px" alt={op.name} />
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
