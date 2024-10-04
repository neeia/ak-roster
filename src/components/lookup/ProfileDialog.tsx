import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BadgeOutlined, Close, Reddit } from "@mui/icons-material";
import { AccountInfo } from "types/doctor";
import { SocialInfo } from "types/social";
import { Operator } from "types/operator";
import OperatorBlock from "../view/OperatorBlock";
import Image from "next/image";

interface Props {
  roster: Record<string, Operator>;
  user?: AccountInfo;
  social?: SocialInfo;
  username?: string;
}

const ProfileDialog = (props: Props) => {
  const { roster, user, social, username } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (user && user.supports && !Array.isArray(user.supports)) {
    user.supports = Object.values(user.supports);
  }
  const getImgSrc = (opId: string) => {
    const op = roster[opId];
    let intermediate = opId;
    if (op.elite === 2) {
      intermediate += "_2";
    } else if (op.elite === 1 && op.op_id === "char_002_amiya") {
      intermediate += "_1";
    }
    return `/img/avatars/${op.skin ?? intermediate}.png`;
  };

  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        aria-label="Filter"
      >
        <BadgeOutlined sx={{ color: "background.paper", mr: 1 }} />
        <Typography variant="h6" textTransform="none" color="background.paper">
          Open Profile
        </Typography>
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={fullScreen}
        keepMounted
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            overflow: "visible",
            maxHeight: "75%",
            alignSelf: { xs: "end", sm: "inherit" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {user?.assistant ? (
            <Box
              sx={{
                mx: "auto",
                width: "144px",
                transform: "translateY(-50%)",
                marginBottom: "-72px",
              }}
            >
              <Image
                src={getImgSrc(user?.assistant)}
                height={240}
                width={240}
                alt=""
              />
            </Box>
          ) : null}
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              "& .mobileHide": {
                display: { xs: "none", sm: "inline" },
              },
            }}
          >
            {user?.displayName ?? username}
            <span className="mobileHide">&apos;s Profile</span>
          </Typography>
          <Typography
            component="div"
            variant="h6"
            sx={{
              marginLeft: "8px",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            {user?.server ?? "Server Unknown"} - {user?.friendCode?.username}#
            {user?.friendCode?.tag ?? "Tag Unknown"} - Level{" "}
            {user?.level ?? "Unknown"}
            <Box
              sx={{
                marginLeft: { xs: "0px", sm: "auto" },
                color: "text.secondary",
              }}
            >
              Onboard: {user?.onboard?.toString()}
            </Box>
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              display: { sm: "none" },
              position: "absolute",
              top: 8,
              right: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              columnGap: "2rem",
              justifyContent: "center",
              "& .MuiDivider-wrapper": {
                color: "text.secondary",
              },
            }}
          >
            <Box>
              <Divider sx={{ mt: 1, mb: 0.5 }} variant="middle" flexItem>
                Support
              </Divider>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  color: "text.main",
                }}
              >
                {user?.supports?.map((s) => {
                  if (!s || !s.opID) return null;
                  if (!s.opSkill) s.opSkill = 0;
                  const op = roster[s.opID];
                  return (
                    <OperatorBlock
                      key={op.op_id}
                      op={op}
                      nobg
                      skill={s.opSkill}
                    />
                  );
                })}
              </Box>
            </Box>
            <Box>
              <Divider sx={{ mt: 1, mb: 0.5 }} variant="middle" flexItem>
                Socials
              </Divider>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto 1fr",
                  gap: 1,
                  alignItems: "center",
                  height: "min-content",
                  pl: 1,
                }}
              >
                <Image
                  src="/img/ext/icon_clyde_white_RGB.svg"
                  width={24}
                  height={24}
                  alt="Discord"
                />
                {social?.discord?.username}#{social?.discord?.tag}
                <Reddit />{" "}
                {social && social.reddit && (
                  <Link
                    href={`https://reddit.com/u/${social.reddit}`}
                    rel="noreferrer"
                  >
                    {social.reddit}
                  </Link>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ProfileDialog;
