import {Platform} from 'react-native';
import {theme} from '../branding/theme';
export type MediaTextFont = "classic" | "elegant" | "fun" | "strong" | "mono";
export type MediaTextSize = "sm" | "md" | "lg";

export type MediaTextOverlayDraft = {
  id?: string;
  text: string;
  font: MediaTextFont;
  size: MediaTextSize;
  color: string;
  bold: boolean;
  italic: boolean;
  background: boolean;
  positionX: number;
  positionY: number;
  boxWidth: number;
  scale?: number;
  referenceWidth?: number;
};

export function createDefaultMediaTextOverlay(): MediaTextOverlayDraft {
  return {
    id: `text-${Date.now()}`,
    text: "",
    font: "classic",
    size: "md",
    color: theme.onDark,
    bold: true,
    italic: false,
    background: true,
    positionX: 0.5,
    positionY: 0.5,
    boxWidth: 0.72,
    scale: 1,
  };
}

export function fontFamilyForOverlay(font: MediaTextFont) {
  if (font === "elegant") return Platform.select({ web: "Georgia, serif", default: "serif" });
  if (font === "fun") return Platform.select({ web: "Trebuchet MS, system-ui, sans-serif", default: "sans-serif" });
  if (font === "mono") return Platform.select({ web: "ui-monospace, monospace", default: "monospace" });
  if (font === "strong") return Platform.select({ web: "Impact, Haettenschweiler, sans-serif", default: "sans-serif" });
  return undefined;
}

export function fontSizeForOverlay(size: MediaTextSize) {
  if (size === "sm") return 18;
  if (size === "lg") return 54;
  return 34;
}

export function lineHeightForOverlay(size: MediaTextSize) {
  if (size === "sm") return 23;
  if (size === "lg") return 62;
  return 40;
}

