export type ImageUploadFieldProps = {
  name: string;
  imageUri?: string;
  onUpload: (file: File | string) => Promise<void>;
  onRemove: () => Promise<void>;
};
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
