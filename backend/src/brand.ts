import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
export const brand = require('../../brand.json') as { name: string; slug: string };
export const { colors } = require('../../frontend/src/branding/tokens.json') as {
  colors: Record<string, string>;
};
