import React from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import { BadgeOutlined, Close, Reddit } from "@mui/icons-material";
import { AccountInfo } from "types/doctor";
import { SocialInfo } from "types/social";
import { Operator } from "types/operator";
import { isObject } from "util";
import OperatorBlock from "../view/OperatorBlock";

interface Props {
  roster: Record<string, Operator>;
  user?: AccountInfo;
  social?: SocialInfo;
}

const ProfileDialog = (props: Props) => {
  const { roster, user, social } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (user && user.support && isObject(user.support)) {
    user.support = Object.values(user.support);
  }
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => { setOpen(true); }} aria-label="Filter">
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
          }
        }}
      >
        <DialogTitle sx={{
          display: "flex",
          flexDirection: "column",
        }}>
          {user?.assistant
            ? <Box component="img"
              src={((opId: string) => {
                const op = roster[opId]
                let intermediate = opId;
                if (op.promotion === 2) {
                  intermediate += "_2";
                } else if (op.promotion === 1 && op.name === "Amiya") {
                  intermediate += "_1";
                }
                return `/img/avatars/${op.skin ?? intermediate}.png`;
              })(user?.assistant)}
              sx={{
                mx: "auto",
                width: "144px",
                transform: "translateY(-50%)",
                marginBottom: "-72px"
              }}
            />
            : null
          }
          <Typography
            component="div"
            variant="h2"
            sx={{
              marginLeft: "8px",
              "& .mobileHide": {
                display: { xs: "none", sm: "" }
              }
            }}
          >
            {user?.displayName}<span className="mobileHide">&apos;s Profile</span>
          </Typography>
          <Typography
            component="div"
            variant="h6"
            sx={{
              marginLeft: "8px",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" }
            }}>
            {user?.server ?? "Server Unknown"} - {user?.friendCode?.username}#{user?.friendCode?.tag ?? "Tag Unknown"} - Level {user?.level ?? "Unknown"}
            <Box sx={{ marginLeft: { xs: "0px", sm: "auto" }, color: "text.secondary" }}>
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
            }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}>
          <Box sx={{
            columnGap: "2rem",
            justifyContent: "center",
            "& .MuiDivider-wrapper": {
              color: "text.secondary"
            }
          }}>
            <Box>
              <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
                Support
              </Divider>
              <Box sx={{
                display: "flex", justifyContent: "space-around", color: "text.main"
              }}>
                {user?.support?.map(s => {
                  if (!s || !s.opID) return null;
                  if (!s.opSkill) s.opSkill = 0;
                  const op = roster[s.opID]
                  return <OperatorBlock key={op.id} op={op} nobg skill={s.opSkill} />
                })}
              </Box>
            </Box>
            <Box>
              <Divider sx={{ mt: 1, mb: 0.5, }} variant="middle" flexItem>
                Socials
              </Divider>
              <Box sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto 1fr",
                gap: 1,
                alignItems: "center",
                height: "min-content", pl: 1
              }}>
                <Box sx={{ borderRadius: "50%", width: "1.5rem", height: "1.5rem", opacity: "0.65" }}
                  component="img"
                  src="/img/ext/icon_clyde_white_RGB.svg"
                  alt="Discord"
                  loading="lazy"
                />
                {social?.discord?.username}#{social?.discord?.tag}
                <Reddit /> {social?.reddit}
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default ProfileDialog;
