import React, { useEffect, useRef } from "react";
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
import OperatorBlock from "../data/SupportBlock";
import Image from "next/image";
import operatorJson from "data/operators";
import { LookupData } from "util/hooks/useLookup";
import getAvatarFull from "util/fns/getAvatarFull";
import html2canvas from "html2canvas";
import ShareDialog from "./ShareDialog";
import { enqueueSnackbar } from "notistack";

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
          backgroundColor: alpha(theme.palette.background.paper, 0.25),
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
                height: { xs: 320, sm: 560 },
                width: { xs: "100vw", sm: 560 },
              }}
            >
              <Image
                src={
                  data.account.assistant
                    ? getAvatarFull({
                        ...data.roster[data.account.assistant],
                        ...operatorJson[data.account.assistant],
                      })
                    : "/img/characters/logo_rhodes.png"
                }
                fill
                sizes="600px"
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
                  backgroundColor: alpha(theme.palette.background.paper, 0.75),
                }}
              >
                {data.account.friendcode && (
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
                        <Image src="/img/assets/discord2.svg" width={18} height={14} alt="discord" />
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
                    sm: alpha(theme.palette.background.paper, 0.75),
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
                  }}
                >
                  {data.supports
                    .sort((a, b) => a.slot - b.slot)
                    .map((s) => {
                      if (!s) return null;
                      const op = data.roster[s.op_id];
                      return <OperatorBlock key={op.op_id} op={{ ...op, ...operatorJson[s.op_id] }} />;
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
