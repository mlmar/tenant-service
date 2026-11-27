import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { theme } from '../branding/theme';
export type IconName=ComponentProps<typeof Ionicons>['name'];
type Props={name:IconName;size?:'small'|'medium'|'large'|'info';tone?:'primary'|'onDark'|'error'};
const sizes={small:18,medium:24,large:28,info:22};
const colors={primary:theme.primaryDark,onDark:theme.onDark,error:theme.error};
/** Shared decorative Ionicons; the containing control supplies its accessible label. */
export function Icon({name,size='medium',tone='primary'}:Props){return <Ionicons name={name} size={sizes[size]} color={colors[tone]} accessible={false}/>;}
