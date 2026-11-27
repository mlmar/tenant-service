import { readFile, writeFile } from 'node:fs/promises';
const brand = JSON.parse(await readFile(new URL('../../brand.json', import.meta.url), 'utf8'));
const { colors } = JSON.parse(await readFile(new URL('../src/branding/tokens.json', import.meta.url), 'utf8'));

const manifestFile = new URL('../dist/manifest.webmanifest', import.meta.url);
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
Object.assign(manifest, {
  name: brand.name,
  short_name: brand.name,
  background_color: colors.primary,
  theme_color: colors.primary,
});
await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n');

const workerFile = new URL('../dist/sw.js', import.meta.url);
const worker = await readFile(workerFile, 'utf8');
await writeFile(workerFile, worker.replace('"__APP_SHELL__"', JSON.stringify(brand.slug + '-shell-')));

const file = new URL('../dist/index.html', import.meta.url);
const html = await readFile(file, 'utf8');
const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
const withViewport = /<meta\b[^>]*name=["']viewport["'][^>]*>/i.test(html)
  ? html.replace(/<meta\b[^>]*name=["']viewport["'][^>]*>/i, viewport)
  : html.replace('</head>', `${viewport}</head>`);
const iconLinks = [
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png?v=g2">',
  '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png?v=g2">',
  '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48.png?v=g2">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
  `<meta name="theme-color" content="${colors.primary}">`,
].join('');
const withoutExpoIcon = withViewport.replace(/<link\b[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*>/gi, '');
await writeFile(file, withoutExpoIcon.replace('</head>', `${iconLinks}</head>`));
