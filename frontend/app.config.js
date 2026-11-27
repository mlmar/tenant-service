const { expo } = require('./app.json');
const brand = require('../brand.json');
const { colors } = require('./src/branding/tokens.json');
const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID || expo.extra?.eas?.projectId;

module.exports = {
  ...expo,
  name: brand.name,
  slug: brand.slug,
  scheme: brand.scheme,
  web: { ...expo.web, name: brand.name },
  ios: { ...expo.ios, bundleIdentifier: brand.bundleIdentifier },
  android: {
    ...expo.android,
    package: brand.bundleIdentifier,
    adaptiveIcon: { ...expo.android.adaptiveIcon, backgroundColor: colors.primary },
  },
  ...(process.env.EXPO_OWNER ? { owner: process.env.EXPO_OWNER } : {}),
  ...(projectId ? {
    extra: { ...expo.extra, eas: { projectId } },
    updates: { url: `https://u.expo.dev/${projectId}` },
  } : {}),
};
