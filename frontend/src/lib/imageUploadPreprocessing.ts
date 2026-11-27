export const AVATAR_UPLOAD_SIZE = 1600;
export const IMAGE_UPLOAD_TARGET_BYTES = 900 * 1024;
export const IMAGE_UPLOAD_QUALITIES = [0.78, 0.66, 0.54, 0.42, 0.32] as const;

export function avatarUploadActions(width: number, height: number) {
  const sourceWidth = Math.max(1, Math.round(width));
  const sourceHeight = Math.max(1, Math.round(height));
  if (Math.max(sourceWidth, sourceHeight) <= AVATAR_UPLOAD_SIZE) return [];
  return sourceWidth >= sourceHeight
    ? [{ resize: { width: AVATAR_UPLOAD_SIZE } }]
    : [{ resize: { height: AVATAR_UPLOAD_SIZE } }];
}

