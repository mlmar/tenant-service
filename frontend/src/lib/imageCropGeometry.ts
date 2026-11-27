export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CropResizeHandle = "tl" | "tr" | "bl" | "br";

export type ImageSize = { width: number; height: number };

export const MIN_IMAGE_CROP_SIZE = 84;

export function normalizedCropAspectRatio(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function cropAspectRatioTuple(value: number): [number, number] {
  const ratio = normalizedCropAspectRatio(value);
  return [Math.max(1, Math.round(ratio * 1000)), 1000];
}

export function initialImageCropBox(
  displayRect: CropRect,
  aspectRatio: number,
): CropRect {
  const ratio = normalizedCropAspectRatio(aspectRatio);
  const maxWidth = Math.min(displayRect.width, displayRect.height * ratio);
  const width = Math.max(
    Math.min(MIN_IMAGE_CROP_SIZE * ratio, maxWidth),
    maxWidth * 0.76,
  );
  const height = width / ratio;
  return {
    x: displayRect.x + (displayRect.width - width) / 2,
    y: displayRect.y + (displayRect.height - height) / 2,
    width,
    height,
  };
}

export function clampImageCropBox(
  cropBox: CropRect,
  displayRect: CropRect,
): CropRect {
  const width = clamp(cropBox.width, Math.min(MIN_IMAGE_CROP_SIZE, displayRect.width), displayRect.width);
  const height = clamp(cropBox.height, Math.min(MIN_IMAGE_CROP_SIZE, displayRect.height), displayRect.height);
  return {
    width,
    height,
    x: clamp(cropBox.x, displayRect.x, displayRect.x + displayRect.width - width),
    y: clamp(cropBox.y, displayRect.y, displayRect.y + displayRect.height - height),
  };
}

export function projectCropBoxToImage(
  cropBox: CropRect,
  displayRect: CropRect,
  imageSize: ImageSize,
): CropRect {
  const normalizedX = clamp((cropBox.x - displayRect.x) / displayRect.width, 0, 1);
  const normalizedY = clamp((cropBox.y - displayRect.y) / displayRect.height, 0, 1);
  const normalizedWidth = clamp(cropBox.width / displayRect.width, 0, 1 - normalizedX);
  const normalizedHeight = clamp(cropBox.height / displayRect.height, 0, 1 - normalizedY);
  const x = normalizedX * imageSize.width;
  const y = normalizedY * imageSize.height;
  return {
    x,
    y,
    width: clamp(normalizedWidth * imageSize.width, 1, imageSize.width - x),
    height: clamp(normalizedHeight * imageSize.height, 1, imageSize.height - y),
  };
}

export function resizeImageCropBox(
  start: CropRect,
  displayRect: CropRect,
  handle: CropResizeHandle,
  dx: number,
  dy: number,
  aspectRatio?: number,
): CropRect {
  if (aspectRatio === undefined) {
    const right = start.x + start.width;
    const bottom = start.y + start.height;
    const minWidth = Math.min(MIN_IMAGE_CROP_SIZE, displayRect.width);
    const minHeight = Math.min(MIN_IMAGE_CROP_SIZE, displayRect.height);
    const left = handle === "tl" || handle === "bl"
      ? clamp(start.x + dx, displayRect.x, right - minWidth)
      : start.x;
    const top = handle === "tl" || handle === "tr"
      ? clamp(start.y + dy, displayRect.y, bottom - minHeight)
      : start.y;
    const nextRight = handle === "tr" || handle === "br"
      ? clamp(right + dx, left + minWidth, displayRect.x + displayRect.width)
      : right;
    const nextBottom = handle === "bl" || handle === "br"
      ? clamp(bottom + dy, top + minHeight, displayRect.y + displayRect.height)
      : bottom;
    return { x: left, y: top, width: nextRight - left, height: nextBottom - top };
  }

  const ratio = normalizedCropAspectRatio(aspectRatio);
  const oppositeRight = start.x + start.width;
  const oppositeBottom = start.y + start.height;
  const maxWidth = Math.min(displayRect.width, displayRect.height * ratio);
  const minWidth = Math.min(maxWidth, MIN_IMAGE_CROP_SIZE * Math.max(1, ratio));
  let width = start.width;
  let x = start.x;
  let y = start.y;

  if (handle === "tl") {
    width = start.width - Math.max(dx, dy * ratio);
    width = clamp(width, minWidth, maxWidth);
    x = oppositeRight - width;
    y = oppositeBottom - width / ratio;
  } else if (handle === "tr") {
    width = start.width + Math.max(dx, -dy * ratio);
    width = clamp(width, minWidth, maxWidth);
    y = oppositeBottom - width / ratio;
  } else if (handle === "bl") {
    width = start.width + Math.max(-dx, dy * ratio);
    width = clamp(width, minWidth, maxWidth);
    x = oppositeRight - width;
  } else {
    width = start.width + Math.max(dx, dy * ratio);
    width = clamp(width, minWidth, maxWidth);
  }

  return clampImageCropBox({ x, y, width, height: width / ratio }, displayRect);
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
