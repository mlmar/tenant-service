import tokens from './tokens.json';
export { tokens };
const c = tokens.colors;
export const theme = {
  primaryAccent: c.accent, primaryDark: c.primary, primaryLight: c.primaryLight,
  mainBackground: c.canvas, mainWhite: c.surface, neutralWhite: c.secondary,
  lightCard: c.lightCard, outlineCard: { background: c.surface, border: c.outline },
  mutedText: c.muted, onDark: c.onDark, error: c.error,
} as const;
