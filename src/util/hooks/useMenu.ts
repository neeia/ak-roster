import { useCallback, useState } from 'react';


function useMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleSettingsButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleSettingsMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const isSettingsMenuOpen = Boolean(anchorEl);

  type Vertical = number | "bottom" | "top" | "center";
  type Horizontal = number | "center" | "right" | "left";

  const menuProps = {
    anchorEl,
    open: isSettingsMenuOpen,
    onClose: handleSettingsMenuClose,
    MenuListProps: {
      "aria-labelledby": "settings-button",
    },
    hideBackdrop: false,
    slotProps: {
      root: {
        slotProps: {
          backdrop: {
            invisible: false,
          },
        },
      },
    },
    anchorOrigin: {
      vertical: "bottom"  as Vertical,
      horizontal: "right" as Horizontal,
    },
    transformOrigin: {
      vertical: "top"  as Vertical,
      horizontal: "right" as Horizontal,
    },
  };

const menuButtonProps = {
  id: "settings-button",
  onClick: handleSettingsButtonClick,
  sx: { alignSelf: "start", justifySelf: "end" },
  "aria-label": "Settings",
  "aria-haspopup": "true",
  "aria-expanded": isSettingsMenuOpen ? "true" : undefined,
  "aria-controls": isSettingsMenuOpen ? "settings-menu" : undefined,
};

  return { setAnchorEl, menuProps, menuButtonProps };
}

export default useMenu;