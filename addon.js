const { serveHTTP, getRouter } = require('stremio-addon-sdk');

// Tvůj addon manifest
const addonManifest = {
  id: 'com.sadkmnt.tv',
  version: '1.0.0',
  name: 'sa-dkmnt.tv',
  description: 'This is a simple addon for sa-dkmnt.tv.',
  resources: ['catalog'],
  types: ['movie'],
  idPrefixes: ['tt'],
  catalogs: [
    {
      type: 'movie',
      id: 'popular',
      name: 'Popular Movies',
    },
  ],
};

// Handlery pro vracení dat
const handlers = {
  catalog: async ({ type, id }) => {
    // Tady můžeš přidat logiku pro získání dat
    return [
      { id: 'tt123456', name: 'My Movie', poster: 'http://example.com/poster.jpg' },
      { id: 'tt789101', name: 'Another Movie', poster: 'http://example.com/another_poster.jpg' }
    ];
  },
};

// Vytvoření routeru pro addon
const addonInterface = getRouter(addonManifest, handlers);

// Spuštění HTTP serveru na portu
const PORT = process.env.PORT || 3000;
serveHTTP(addonInterface, { port: PORT })
  .then(() => {
    console.log(`Addon is running on port ${PORT}`);
  })
  .catch((err) => {
    console.error('Error starting addon:', err);
  });
