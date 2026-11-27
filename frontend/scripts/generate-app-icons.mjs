import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const frontend=fileURLToPath(new URL('..',import.meta.url));
const assets=path.join(frontend,'assets/icons');
const publicDir=path.join(frontend,'public');
const { colors } = JSON.parse(readFileSync(path.join(frontend, 'src/branding/tokens.json'), 'utf8'));
const background = colors.primary;
const source = path.join(assets, 'source/mark.svg');
for (const directory of [assets, path.join(assets, 'ios'), path.join(assets, 'android'), path.join(publicDir, 'icons')]) {
  await mkdir(directory, { recursive: true });
}
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const artwork = await sharp(source).resize(1024, 1024, { fit: 'contain', background: transparent }).ensureAlpha().png().toBuffer();
const icon = await sharp(artwork).flatten({ background }).removeAlpha().png().toBuffer();
await writeFile(path.join(assets, 'logo-mark-transparent.png'), artwork);
await writeFile(path.join(assets,'app-icon.png'),icon);
for(const size of [20,29,40,58,60,76,80,87,120,152,167,180,1024])await sharp(icon).resize(size,size).png().toFile(path.join(assets,`ios/icon-${size}.png`));
for(const [density,size]of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192],['play-store',512]])await sharp(icon).resize(size,size).png().toFile(path.join(assets,`android/icon-${density}.png`));
// Keep the mark inside Android's adaptive icon safe area.
const glyph = await sharp(artwork).trim().resize(480, 480, { fit: 'contain', background: transparent }).png().toBuffer();
const foreground = await sharp(glyph).extend({ top: 272, bottom: 272, left: 272, right: 272, background: transparent }).png().toBuffer();
await writeFile(path.join(assets, 'adaptive-foreground.png'), foreground);
const alpha = await sharp(foreground).extractChannel('alpha').raw().toBuffer();
const white = await sharp({ create: { width: 1024, height: 1024, channels: 3, background: '#fff' } })
  .joinChannel(alpha, { raw: { width: 1024, height: 1024, channels: 1 } })
  .png().toBuffer();
await writeFile(path.join(assets, 'adaptive-monochrome.png'), white);
const maskable = await sharp(foreground).flatten({ background }).removeAlpha().png().toBuffer();
for(const size of [192,512]){
 await sharp(icon).resize(size,size).png().toFile(path.join(publicDir,`icons/icon-${size}.png`));
 await sharp(maskable).resize(size,size).png().toFile(path.join(publicDir,`icons/icon-maskable-${size}.png`));
}
const favicon = icon;
for(const size of [16,32,48])await sharp(favicon).resize(size,size).png().toFile(path.join(publicDir,`favicon-${size}.png`));
await sharp(favicon).resize(48,48).png().toFile(path.join(assets,'favicon.png'));
await sharp(icon).resize(180,180).png().toFile(path.join(publicDir,'apple-touch-icon.png'));
// PNG-compressed ICO entries are supported by modern browsers and Windows.
const sizes=[16,32,48];const buffers=await Promise.all(sizes.map(size=>sharp(favicon).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
let offset=header.length;
for(let i=0;i<sizes.length;i++){const cursor=6+16*i;header[cursor]=sizes[i];header[cursor+1]=sizes[i];header.writeUInt16LE(1,cursor+4);header.writeUInt16LE(32,cursor+6);header.writeUInt32LE(buffers[i].length,cursor+8);header.writeUInt32LE(offset,cursor+12);offset+=buffers[i].length;}
await writeFile(path.join(publicDir,'favicon.ico'),Buffer.concat([header,...buffers]));
const metadata=await sharp(path.join(assets,'app-icon.png')).metadata();
if(metadata.width!==1024||metadata.height!==1024||metadata.hasAlpha)throw new Error('iOS master must be 1024px square and opaque');
console.log('Exported iOS, Android, adaptive/monochrome, Apple touch, PWA/maskable, and favicon assets.');
