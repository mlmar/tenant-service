import {theme as themeColors} from '../branding/theme';
import {fontFamilyForOverlay,fontSizeForOverlay,lineHeightForOverlay,type MediaTextOverlayDraft} from './mediaTextOverlay';
import { projectCropBoxToImage, type CropRect, type ImageSize } from './imageCropGeometry';
type CropBox=CropRect;type DisplayRect=CropRect;type Size=ImageSize;
export async function cropImageOnWeb(
  uri: string,
  cropBox: CropBox,
  displayRect: DisplayRect,
  imageSize: Size,
) {
  if (typeof document === "undefined") return uri;

  const projected = projectCropBoxToImage(cropBox, displayRect, imageSize);
  const sourceX = projected.x;
  const sourceY = projected.y;
  const sourceWidth = projected.width;
  const sourceHeight = projected.height;
  const ratio = sourceWidth / sourceHeight;
  const canvas = document.createElement("canvas");
  const outputWidth = ratio >= 1 ? 1080 : Math.round(1080 * ratio);
  const outputHeight = ratio >= 1 ? Math.round(1080 / ratio) : 1080;
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the cropped photo.");

  const imageSource = await loadWebImageSource(uri);
  const image = await loadWebImage(imageSource.uri);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  try {
    return canvas.toDataURL("image/jpeg", 0.78);
  } finally {
    imageSource.revoke?.();
  }
}

async function loadWebImageSource(uri: string) {
  if (!uri.startsWith("http")) return { uri };

  const response = await fetch(uri, { mode: "cors" });
  if (!response.ok) {
    throw new Error("Could not load the photo for cropping.");
  }
  const objectUrl = URL.createObjectURL(await response.blob());
  return {
    uri: objectUrl,
    revoke: () => URL.revokeObjectURL(objectUrl),
  };
}

function loadWebImage(uri: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the selected photo for cropping."));
    image.src = uri;
  });
}


export async function applyTextOverlaysToImageOnWeb(
  uri: string,
  overlays: MediaTextOverlayDraft[],
  previewWidth: number,
  previewHeight: number,
) {
  if (typeof document === "undefined") return uri;
  if (!overlays.some((overlay) => overlay.text.trim())) return uri;

  const imageSource = await loadWebImageSource(uri);
  const image = await loadWebImage(imageSource.uri);
  const canvas = document.createElement("canvas");
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, 1080 / sourceWidth);
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the text overlay.");

  try {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    overlays.forEach((overlay) => drawCenteredTextOverlay(
      context,
      overlay,
      canvas.width,
      canvas.height,
      previewWidth,
      previewHeight,
    ));
    return canvas.toDataURL("image/jpeg", 0.78);
  } finally {
    imageSource.revoke?.();
  }
}

export function drawCenteredTextOverlay(
  context: CanvasRenderingContext2D,
  overlay: MediaTextOverlayDraft,
  width: number,
  height: number,
  previewWidth: number,
  previewHeight: number,
) {
  const previewScale =
    previewWidth > 0 && previewHeight > 0
      ? Math.min(width / previewWidth, height / previewHeight)
      : Math.min(width, height) / 640;
  const scale = Math.max(0.7, previewScale) * clamp(overlay.scale ?? 1, 0.6, 2);
  const fontSize = Math.round(fontSizeForOverlay(overlay.size) * scale);
  const lineHeight = Math.round(lineHeightForOverlay(overlay.size) * scale);
  const fontFamily = fontFamilyForOverlay(overlay.font) ?? "system-ui, sans-serif";
  const fontStyle = overlay.italic ? "italic" : "normal";
  const fontWeight = overlay.bold ? "800" : "500";
  const font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  const maxWidth = width * clamp(overlay.boxWidth ?? 0.72, 0.28, 0.92);
  context.font = font;
  const lines = wrapCanvasText(context, overlay.text.trim(), maxWidth, {
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
  });
  const textWidth = Math.min(
    maxWidth,
    Math.max(...lines.map((line) => context.measureText(line).width)),
  );
  const textHeight = lines.length * lineHeight;
  const paddingX = 18 * scale;
  const paddingY = 10 * scale;
  const rectWidth = textWidth + paddingX * 2;
  const rectHeight = textHeight + paddingY * 2;
  const insetX = overlay.background ? rectWidth / 2 : textWidth / 2;
  const insetY = overlay.background ? rectHeight / 2 : textHeight / 2;
  const centerX = clamp(width * (overlay.positionX ?? 0.5), insetX, width - insetX);
  const centerY = clamp(height * (overlay.positionY ?? 0.5), insetY, height - insetY);

  context.save();
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(0,0,0,0.42)";
  context.shadowBlur = 5 * scale;
  context.shadowOffsetY = 1 * scale;

  if (overlay.background) {
    fillRoundRect(
      context,
      centerX - rectWidth / 2,
      centerY - rectHeight / 2,
      rectWidth,
      rectHeight,
      14 * scale,
      themeColors.primaryDark,
    );
  }

  context.fillStyle = overlay.color;
  lines.forEach((line, index) => {
    const lineY = centerY - textHeight / 2 + lineHeight * index + lineHeight / 2;
    context.fillText(line, centerX, lineY, maxWidth);
  });
  context.restore();
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: {
    fontFamily: string;
    fontSize: number;
    fontStyle: string;
    fontWeight: string;
  },
) {
  context.font = `${font.fontStyle} ${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`;
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
      return;
    }
    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 3);
}

function fillRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
) {
  context.save();
  context.fillStyle = fillStyle;
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fill();
  context.restore();
}


function clamp(value:number,min:number,max:number){if(max<min)return min;return Math.min(Math.max(value,min),max);}
