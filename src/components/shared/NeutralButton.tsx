import { styled } from '@mui/material/styles';
import { ButtonBase, ButtonBaseProps } from '@mui/material';

const NeutralButton = styled(ButtonBase)<ButtonBaseProps>(({ theme }) => ({
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  lineHeight: "1",
  borderRadius: 4,
}));

export default NeutralButton;