import { createClient } from '@supabase/supabase-js';
const schema = process.env.DATABASE_SCHEMA;
const expectedBucket = schema === 'tenant_service_prod' ? 'tenant-service-prod-avatars' : 'tenant-service-dev-avatars';
function avatarStorage() {
    const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_STORAGE_SECRET, bucket = process.env.SUPABASE_AVATAR_BUCKET;
    if (!url || !key || bucket !== expectedBucket)
        throw Error('Avatar storage unavailable');
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(bucket);
}
// Application-facing port; the Supabase SDK does not escape this adapter.
import type { AvatarStorage } from './ports.js';
export const avatarStorageAdapter: AvatarStorage = {
    async upload(path, image) { const result = await avatarStorage().upload(path, image, { contentType: 'image/webp', upsert: false }); if (result.error)
        throw result.error; },
    async remove(path) { const result = await avatarStorage().remove([path]); if (result.error)
        throw result.error; },
    async signedUrl(path) { const result = await avatarStorage().createSignedUrl(path, 300); if (result.error)
        throw result.error; return result.data.signedUrl; },
};
