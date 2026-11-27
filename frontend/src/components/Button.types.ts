import type { IconName } from './Icon';
import type { ButtonVariant } from '../branding/buttons';
export type ButtonProps = {
  label: string;
  icon?: IconName;
  size?: 'default' | 'sm';
  accessibilityLabel?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  busy?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
};
