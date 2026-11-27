const { getDefaultConfig } = require('expo/metro-config');
const { resolve } = require('node:path');

const config = getDefaultConfig(__dirname);
// The root brand file is shared with the API and the release tooling.
config.watchFolders = [...new Set([...config.watchFolders, resolve(__dirname, '..')])];
config.server = {
  ...config.server,
  enhanceMiddleware: middleware => (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return middleware(req, res, next);
  },
};
module.exports = config;
