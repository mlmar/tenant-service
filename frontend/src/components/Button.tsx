import { Icon } from './Icon';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { buttonMetrics, buttonVariants } from '../branding/buttons';
import { theme } from '../branding/theme';

import type { ButtonProps } from './Button.types';

export function Button({ label, onPress, variant = 'primary', disabled = false, busy = false, fullWidth = false,icon,size='default',accessibilityLabel }: ButtonProps) {
  const [focused, setFocused] = useState(false);
  const colors = buttonVariants[variant];
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel??label} accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.button, size==='sm'&&styles.small, variantStyles[variant], fullWidth && styles.fullWidth, pressed && styles.pressed, (disabled || busy) && styles.disabled, focused && Platform.OS === 'web' && styles.focus]}>
    {icon ? <Icon name={icon} size="small" tone={variant==='primary'?'onDark':'primary'}/> : null}
    <View style={styles.labelRow}><Text style={[styles.label, size==='sm'&&styles.smallLabel, labelStyles[variant]]}>{label}</Text>{busy ? <ActivityIndicator color={colors.foreground} size="small" style={styles.loadingIndicator}/> : null}</View>
  </Pressable>;
}
const styles = StyleSheet.create({
  labelRow:{flexDirection:'row',alignItems:'center',justifyContent:'center'},
  loadingIndicator:{marginLeft:8},
  small:{minHeight:36,padding:8},
  smallLabel:{fontSize:13,lineHeight:18},
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  button: { alignSelf: 'flex-start', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', minHeight: buttonMetrics.minHeight, borderRadius: buttonMetrics.borderRadius, borderWidth: buttonMetrics.borderWidth, paddingHorizontal: buttonMetrics.paddingHorizontal, paddingVertical: buttonMetrics.paddingVertical },
  label: { fontSize: buttonMetrics.fontSize, fontWeight: buttonMetrics.fontWeight, lineHeight: buttonMetrics.lineHeight },
  focus: { outlineWidth: 3, outlineColor: theme.primaryAccent, outlineOffset: 3 },
});

const variantStyles = StyleSheet.create(Object.fromEntries(Object.entries(buttonVariants).map(([name, colors]) => [name, { backgroundColor: colors.background, borderColor: colors.border }])) as Record<keyof typeof buttonVariants, { backgroundColor: string; borderColor: string }>);
const labelStyles = StyleSheet.create(Object.fromEntries(Object.entries(buttonVariants).map(([name, colors]) => [name, { color: colors.foreground }])) as Record<keyof typeof buttonVariants, { color: string }>);
