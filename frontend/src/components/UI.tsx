import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme, tokens } from '../branding/theme';
import type { CardProps, HeadingProps, AvatarProps } from './UI.types';
export function Card({ children, centered, padding = 'standard', variant = 'standard' }: CardProps) { return <View style={[styles.card, centered && styles.centered, padding === 'none' && styles.flush, variant === 'module' && styles.module]}>{children}</View>; }
export function ScreenHeading({ title, eyebrow, description }: HeadingProps) { return <View style={styles.heading}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text accessibilityRole="header" style={styles.title}>{title}</Text>{description && <Text style={styles.body}>{description}</Text>}</View>; }
export function Avatar({ name, imageUrl, size = 'small' }: AvatarProps) { return <View style={[styles.avatar, size === 'large' && styles.large]}>{imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} accessibilityLabel={`${name} profile photo`} /> : <Text style={[styles.initials, size === 'large' && styles.largeInitials]}>{name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</Text>}</View>; }
export function ActionGroup({ children }: { children: ReactNode }) { return <View style={styles.actions}>{children}</View>; }
const styles = StyleSheet.create({
 card: { backgroundColor: theme.mainWhite, borderWidth: 1, borderColor: theme.neutralWhite, borderRadius: tokens.card.radius, padding: tokens.card.padding, gap: tokens.card.gap },
 module: { borderColor: tokens.colors.moduleBorder },
 flush: { padding: 0, overflow: 'hidden' },
 centered: { alignItems: 'center', gap: 24 }, heading: { gap: 8 }, eyebrow: { fontSize: 11, letterSpacing: 1.8, fontWeight: '700', color: theme.mutedText }, title: { fontSize: tokens.type.titleSize, lineHeight: tokens.type.titleLine, fontWeight: '600', color: theme.primaryDark }, body: { fontSize: tokens.type.bodySize, lineHeight: tokens.type.bodyLine, color: theme.mutedText },
 avatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', backgroundColor: theme.lightCard, alignItems: 'center', justifyContent: 'center' }, large: { width: 72, height: 72, borderRadius: 36 }, image: { width: '100%', height: '100%' }, initials: { fontSize: 14, fontWeight: '700', color: theme.primaryDark }, largeInitials: { fontSize: 24 }, actions: { width: '100%', gap: 12 },
});
