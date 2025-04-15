import React, { useRef } from "react";
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close, IosShare, Reddit } from "@mui/icons-material";
import SupportBlock from "../data/SupportBlock";
import Image from "components/base/Image";
import operatorJson from "data/operators";
import { LookupData } from "util/hooks/useLookup";
import getAvatarFull from "util/fns/getAvatarFull";
import html2canvas from "html2canvas";
import ShareDialog from "./ShareDialog";
import { enqueueSnackbar } from "notistack";
import imageBase from "util/imageBase";

interface Props extends DialogProps {
  data?: LookupData;
  onClose: () => void;
}

const ProfileDialog = (props: Props) => {
  const { data, onClose, ...rest } = props;

  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("sm"));

  const [saving, setSaving] = React.useState(false);

  const ssTarget = useRef<HTMLDivElement>();
  const shareAnchor = useRef<HTMLButtonElement | null>(null);

  const downloadImage = async (copy = false) => {
    if (!ssTarget.current || !data) return;

    ssTarget.current.classList.add("screenshot");
    const canvas = await html2canvas(ssTarget.current);
    const canvasUrl = canvas.toDataURL();
    const link = document.createElement("a");

    link.href = canvasUrl;
    link.download = `${data.account.username}.png`;

    document.body.appendChild(link);
    if (!copy) {
      link.click();
    } else {
      canvas.toBlob((blob) => {
        if (!blob) return;

        try {
          navigator.clipboard
            .write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ])
            .then(() => {
              enqueueSnackbar("Copied image to clipboard", { variant: "success" });
            });
        } catch (error) {
          console.error(error);
        }
      });
    }
    document.body.removeChild(link);
    ssTarget.current.classList.remove("screenshot");
  };

  const handleImageDownload = async () => {
    setSaving(true);
    downloadImage().then(() => setSaving(false));
  };

  const handleImageCopy = async () => {
    setSaving(true);
    downloadImage(true).then(() => setSaving(false));
  };

  const copyLink = React.useCallback(() => {
    if (!data) return;
    const link = `${window.location.origin}/u/${data.account.username}`;
    navigator.clipboard.writeText(link).then(() => {
      enqueueSnackbar("Copied link to clipboard", { variant: "success" });
    });
  }, [data]);

  const [open, setOpen] = React.useState(false);
  const openShare = React.useCallback(() => {
    setOpen(true);
  }, []);

  const closeShare = React.useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Dialog
      onClose={onClose}
      fullScreen={fullScreen}
      keepMounted
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          background: "none",
          margin: 0,
          overflow: "hidden",
        },
      }}
      sx={{
        width: "100%",
        alignSelf: { xs: "end", sm: "inherit" },
      }}
      {...rest}
    >
      <DialogContent
        ref={ssTarget}
        id="profile-content"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.25),
          backdropFilter: "blur(24px) grayscale(50%)",
          p: 0,
          overflow: "hidden",
          "&.screenshot": {
            backgroundColor: "background.paper",
            backdropFilter: "none",
          },
        }}
      >
        {data && (
          <>
            <Typography
              component="h1"
              sx={{
                fontSize: "12px",
                backgroundColor: "primary.main",
                color: "primary.contrastText",
                borderRadius: "4px",
                p: "2px 8px",
                m: 1,
                width: "fit-content",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            >
              /u/{data.account.username}
            </Typography>
            <Box
              sx={{
                position: "relative",
                height: { xs: "100vw", sm: 560 },
                width: { xs: "100vw", sm: 560 },
                "& > img": {
                  objectFit: "contain",
                },
              }}
            >
              <Image
                src={
                  data.account.assistant
                    ? getAvatarFull({
                        ...data.roster[data.account.assistant],
                        ...operatorJson[data.account.assistant],
                      })
                    : `${imageBase}/characters/logo_rhodes.webp`
                }
                sx={{
                  height: "100%",
                  width: "100%",
                  objectFit: "contain",
                }}
                alt=""
              />
              <Typography
                component="aside"
                sx={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  p: "8px 8px 16px 16px",
                  backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.75),
                }}
              >
                {data.account.friendcode.username && (
                  <Typography>
                    {data.account.friendcode.username}#{data.account.friendcode.tag}
                  </Typography>
                )}
                {(data.account.server || data.account.level || data.account.onboard) && (
                  <Typography sx={{ fontSize: "14px" }}>
                    {[data.account.server, data.account.level && `Level ${data.account.level}`, data.account.onboard]
                      .filter((s) => s)
                      .join(" - ")}
                  </Typography>
                )}
                {(data.account.discordcode || data.account.reddituser) && (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {data.account.discordcode && (
                      <Typography sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <svg viewBox="0 0 127.14 96.36" width="20" height="15">
                          <path
                            fill="currentColor"
                            d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
                          />
                        </svg>
                        {data.account.discordcode}
                      </Typography>
                    )}
                    {data.account.reddituser && (
                      <Typography sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Reddit />
                        {data.account.reddituser}
                      </Typography>
                    )}
                  </Box>
                )}
              </Typography>
            </Box>
            {data.supports.length > 0 && (
              <Box
                sx={{
                  position: {
                    xs: "relative",
                    sm: "absolute",
                  },
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: { xs: "center", sm: "end" },
                  gap: 1,
                  alignItems: { xs: "start", sm: "center" },
                  backgroundColor: {
                    xs: "none",
                    sm: (theme) => alpha(theme.palette.background.paper, 0.75),
                  },
                  padding: {
                    xs: "8px",
                    sm: "16px 8px",
                  },
                }}
              >
                <Typography variant="h3" component="h2" sx={{ fontSize: "16px" }}>
                  Support Units
                </Typography>
                <Box
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    display: "flex",
                    flexDirection: { xs: "row", sm: "column" },
                    gap: "16px 0px",
                    justifyContent: { xs: "space-around", sm: "center" },
                    filter: "drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.75))",
                  }}
                >
                  {data.supports
                    .sort((a, b) => a.slot - b.slot)
                    .map((s) => {
                      if (Object.keys(data.roster).length == 0 && !s) return null;
                      const op = data.roster[s.op_id];
                      return <SupportBlock key={op.op_id} op={{ ...op, ...operatorJson[s.op_id] }} />;
                    })}
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <Box
        sx={{
          position: "absolute",
          right: 0,
          top: 0,
          display: "flex",
          gap: 1,
          p: 1,
        }}
      >
        <Button component="button" onClick={openShare} ref={shareAnchor}>
          <IosShare />
        </Button>
        <Button onClick={() => onClose()} variant="text">
          <Close color="action" />
        </Button>
      </Box>
      <ShareDialog
        anchorEl={shareAnchor.current}
        open={open}
        onClose={closeShare}
        save={handleImageDownload}
        copyImage={handleImageCopy}
        copyUrl={copyLink}
        saving={saving}
      />
    </Dialog>
  );
};
export default ProfileDialog;
