import { Tooltip, Chip, Box, Typography, Divider } from "@mui/material";
import Image from "next/image";
import React from "react";
import { RecruitableOperator } from "types/recruit";

const RecruitableOperatorChip: React.FC<RecruitableOperator & { img?: string, alt?: string }> = React.memo(
  (props) => {
    const { id, tags, rarity, name, potential, img, alt } = props;
    return (
      <>
        <Tooltip
          key="chipWrapper"
          arrow
          title={tags.join(", ")}
          describeChild
          placement="bottom"
        >
          <Chip
            className={`rarity-${rarity}`}
            avatar={
              <Box ml={1} mr={-2}>
                <Image
                  src={`/img/avatars/${id}.png`}
                  width={24}
                  height={24}
                  className="operator-avatar"
                  alt=""
                />
              </Box>
            }
            label={
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mr: -0.5,
                "& img": {
                  filter: potential ? `drop-shadow(0px 0px 2px rgba(${`${(1 - potential/3) * 255 + 127.5},`.repeat(3)} 0.35))` : undefined,
                }
              }}>
                <Typography component="span">
                  {name}
                </Typography>
                {img &&
                  <>
                    <Divider orientation="vertical" flexItem />
                    <Image
                      src={img}
                      width={24}
                      height={24}
                      alt={alt ?? ""}
                    />
                  </>
                }
              </Box>}
          />
        </Tooltip>
      </>
    );
  }
);
RecruitableOperatorChip.displayName = "RecruitableOperatorChip";
export default RecruitableOperatorChip;