import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import {projectCropBoxToImage,type CropRect,type ImageSize} from './imageCropGeometry';
type CropBox=CropRect;type DisplayRect=CropRect;type Size=ImageSize;
export async function cropImageOnNative(
  uri: string,
  cropBox: CropBox,
  displayRect: DisplayRect,
  imageSize: Size,
) {
  const localSource = await localNativeEditingSource(uri);
  try {
    const projected = projectCropBoxToImage(cropBox, displayRect, imageSize);
    const sourceX = projected.x;
    const sourceY = projected.y;
    const sourceWidth = projected.width;
    const sourceHeight = projected.height;
    const ratio = sourceWidth / sourceHeight;
    const outputWidth = ratio >= 1 ? 1080 : Math.round(1080 * ratio);
    const outputHeight = ratio >= 1 ? Math.round(1080 / ratio) : 1080;
    const result = await ImageManipulator.manipulateAsync(
      localSource.uri,
      [
        {
          crop: {
            originX: Math.round(sourceX),
            originY: Math.round(sourceY),
            width: Math.round(sourceWidth),
            height: Math.round(sourceHeight),
          },
        },
        { resize: { width: outputWidth, height: outputHeight } },
      ],
      {
        compress: 0.78,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    return result.uri;
  } finally {
    if (localSource.temporary) {
      await FileSystem.deleteAsync(localSource.uri, { idempotent: true }).catch(() => undefined);
    }
  }
}

async function localNativeEditingSource(uri: string) {
  if (!/^https?:\/\//i.test(uri)) return { uri, temporary: false };
  const cacheDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!cacheDirectory) throw new Error("Could not prepare the photo for editing.");
  const targetUri = `${cacheDirectory}tenant-service-edit-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.jpg`;
  const result = await FileSystem.downloadAsync(uri, targetUri);
  if (result.status < 200 || result.status >= 300) {
    await FileSystem.deleteAsync(targetUri, { idempotent: true }).catch(() => undefined);
    throw new Error(`Could not download the photo for editing (${result.status}).`);
  }
  return { uri: result.uri, temporary: true };
}

