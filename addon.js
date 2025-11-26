const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

const BASE_URL = 'https://dokumenty.tv';
const MANIFEST = require('./manifest.json');

const builder = new addonBuilder(MANIFEST);

async function fetchAndParse(targetUrl) {
    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            timeout: 15000
        });
        return cheerio.load(response.data);
    } catch (err) {
        console.error(`Chyba při stahování URL ${targetUrl}:`, err.message);
        return null;
    }
}

function absolutize(src, base) {
    if (!src) return null;
    return url.resolve(base, src);
}

// CATALOG
builder.defineCatalogHandler(async ({ extra }) => {
    const items = [];
    const genre = (extra && extra.genre) ? extra.genre : 'Poslední přidané';

    const urlMap = {
        'Nejsledovanější': '/najsledovanejsie/',
        'Krimi': '/krimi/',
        'Historie': '/historia/',
        'Příroda': '/priroda/',
        'Technika': '/veda-a-technika/',
        'Poslední přidané': '/'
    };

    const listUrl = `${BASE_URL}${urlMap[genre] || '/'}`;
    const $ = await fetchAndParse(listUrl);
    if (!$) return { metas: [] };

    // Adjust selectors to common patterns; tolerate variations
    const selectors = ['.post-item', '.document-box', '.post', '.entry'];
    selectors.forEach(sel => {
        $(sel).each((i, el) => {
            try {
                const $el = $(el);
                // title selectors
                let title = $el.find('.post-title, .title, h2, h3, a').first().text().trim();
                // fallback: alt or title attribute on images or links
                if (!title) title = $el.find('img').attr('alt') || $el.find('a').attr('title') || '';
                title = title.trim();
                const link = $el.find('a').attr('href') || $el.find('a').first().attr('href');
                let poster = $el.find('img').attr('src') || $el.find('img').attr('data-src') || null;
                poster = absolutize(poster, BASE_URL);

                const yearMatch = title.match(/\((\d{4})\)/);
                const year = yearMatch ? yearMatch[1] : undefined;
                const cleanTitle = title.replace(yearMatch ? yearMatch[0] : '', '').trim();

                if (link && cleanTitle) {
                    const parsed = url.parse(link);
                    const path = parsed.pathname || link;
                    const stremioId = `dtv:${path.startsWith('/') ? path : '/' + path}`;

                    items.push({
                        id: stremioId,
                        type: 'movie',
                        name: cleanTitle,
                        poster: poster || '',
                        posterShape: 'regular',
                        year: year
                    });
                }
            } catch (e) {
                // ignore single-item failure
                console.error('Parsing item failed:', e.message);
            }
        });
    });

    return { metas: items };
});

// STREAM
builder.defineStreamHandler(async ({ id }) => {
    try {
        const docPath = id.replace(/^dtv:/, '');
        const pageUrl = docPath.startsWith('http') ? docPath : `${BASE_URL}${docPath}`;
        const $ = await fetchAndParse(pageUrl);
        if (!$) return { streams: [] };

        // hledání iframe embedů
        let iframeSrc = $('iframe#player, .embed-container iframe, iframe').first().attr('src') || null;
        if (!iframeSrc) {
            // možná je embed v data atributu nebo scriptu
            iframeSrc = $('[data-src]').attr('data-src') || $('[data-embed]').attr('data-embed') || null;
        }
        if (!iframeSrc) return { streams: [] };

        // normalizace protocol-relative URL
        if (iframeSrc.startsWith('//')) iframeSrc = 'https:' + iframeSrc;

        // Pokud je to YouTube/Vimeo embed, přepíšeme na přímý watch URL (volitelné)
        if (iframeSrc.includes('youtube.com') && iframeSrc.includes('/embed/')) {
            const videoId = iframeSrc.split('/embed/')[1].split(/[?&]/)[0];
            iframeSrc = `https://www.youtube.com/watch?v=${videoId}`;
        }

        // Vrátíme seznam streamů
        return {
            streams: [{
                url: iframeSrc,
                title: 'Dokumenty.TV Stream',
                name: 'Dokumenty.TV'
            }]
        };
    } catch (err) {
        console.error('Chyba ve stream handleru:', err.message);
        return { streams: [] };
    }
});

// SPUŠTĚNÍ SERVERU
const PORT = process.env.PORT || 7000;
serveHTTP(builder.get(), { port: PORT })
.then(() => {
    console.log(`Dokumenty.TV Stremio Addon běží: http://localhost:${PORT}/manifest.json`);
})
.catch(err => {
    console.error('Chyba při spouštění serveru:', err);
});
