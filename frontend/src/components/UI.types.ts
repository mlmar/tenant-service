import type { ReactNode } from 'react';
export type CardProps = { children: ReactNode; centered?: boolean; padding?: 'standard' | 'none'; variant?: 'standard' | 'module' };
export type HeadingProps = { title: string; eyebrow?: string; description?: string };
export type AvatarProps = { name: string; imageUrl?: string; size?: 'small' | 'large' };
