import React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckIcon from '@mui/icons-material/Check';
import { IconButton } from '@mui/material';
import SettingsIcon from "@mui/icons-material/Settings";

interface SettingsMenuItemProps {
  onClick: () => void;
  checked: boolean;
  children: React.ReactNode;
}

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({ onClick, checked, children }) => {
  return (
    <MenuItem onClick={onClick}>
      {checked ? (
        <>
          <ListItemIcon>
            <CheckIcon />
          </ListItemIcon>
          {children}
        </>
      ) : (
        <ListItemText inset>{children}</ListItemText>
      )}
    </MenuItem>
  );
};

const SettingsMenu: React.FC<{ children: React.ReactNode; props: any }> = ({ children, props }) => {
  return (
    <Menu {...props}>
      {children}
    </Menu>
  );
};

interface SettingsButtonProps {
  props: any;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ props }) => {
  return (
    <IconButton {...props}>
      <SettingsIcon />
    </IconButton>
  );
};

export { SettingsMenu, SettingsMenuItem, SettingsButton };