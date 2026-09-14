const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The Firebase JS SDK ships .cjs entry points that Metro's package-exports
// resolution picks wrongly on native; this is the setup Firebase documents for Expo.
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
