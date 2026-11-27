import sharp from 'sharp';
import { ApplicationError } from '../applicationError.js';
import type { AvatarProcessor } from './ports.js';
export const avatarProcessor: AvatarProcessor = { async prepare(input) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(input.contentType.split(';')[0]))
            throw new ApplicationError('unsupported_image', 'Choose a JPG, PNG, or WebP image');
        try {
            const decoder = sharp(input.bytes, { limitInputPixels: 40000000, animated: false });
            const metadata = await decoder.metadata();
            if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? ''))
                throw Error('Unsupported image');
            return await decoder.rotate().resize(512, 512, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
        }
        catch {
            throw new ApplicationError('invalid_image', 'Invalid image');
        }
    } };
