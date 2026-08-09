const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite on web ships as a wa-sqlite WASM build — Metro must bundle .wasm.
config.resolver.assetExts.push('wasm');

// wa-sqlite runs in a worker backed by SharedArrayBuffer, which the browser only
// allows in a cross-origin-isolated context. Send the required headers in dev.
config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    middleware(req, res, next);
  };
};

module.exports = config;
