/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Correctif "client-only" pour certaines libs qui tentent d'importer des modules Node (fs, path, crypto…) côté navigateur.
  // Utile si tu vois des erreurs du type "Module not found: Can't resolve 'fs' / 'crypto' / 'path'" avec xlsx.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        zlib: false,
        util: false
      };
    }
    return config;
  },

  // (Optionnel) Générer des sourcemaps en prod pour faciliter le debug.
  // Mets à true si besoin de déboguer en prod.
  productionBrowserSourceMaps: false,
};

export default nextConfig;
