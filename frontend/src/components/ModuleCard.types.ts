import type { ImageSourcePropType } from 'react-native';
export type ModuleCardProps = {
  tone?: 'accent' | 'primary';
  onPress?: () => void;
  title: string;
  description: string;
  illustration: ImageSourcePropType;
};
