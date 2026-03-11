const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
]);

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_DIR = path.join(__dirname, 'cache');
const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const ensureCacheDir = (subdir) => {
  const dir = path.join(CACHE_DIR, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const getCachePath = (subdir, url) => {
  const hash = crypto.createHash('sha256').update(url).digest('hex');
  return path.join(ensureCacheDir(subdir), `${hash}.json`);
};

const readCache = (subdir, url) => {
  const filePath = getCachePath(subdir, url);
  try {
    const stat = fs.statSync(filePath);
    if (Date.now() - stat.mtimeMs > CACHE_MAX_AGE_MS) {
      fs.unlinkSync(filePath);
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
};

const writeCache = (subdir, url, data) => {
  const filePath = getCachePath(subdir, url);
  fs.writeFileSync(filePath, JSON.stringify(data));
};

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const normalizeUrl = (inputUrl = '') => {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const candidate = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(candidate);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch (error) {
    return null;
  }
};

app.post('/api/scrape', async (req, res) => {
  try {
    const targetUrl = normalizeUrl(req.body?.url);

    if (!targetUrl) {
      return res.status(400).json({ error: 'A valid HTTP(S) URL is required' });
    }

    const cached = readCache('scrape', targetUrl);
    if (cached) return res.json(cached);

    const response = await fetch(targetUrl);
    const html = await response.text();
    const metadata = await metascraper({ html, url: targetUrl });

    writeCache('scrape', targetUrl, metadata);
    res.json(metadata);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to scrape URL', details: error.message });
  }
});

app.post('/api/readable', async (req, res) => {
  let dom;

  try {
    const targetUrl = normalizeUrl(req.body?.url);

    if (!targetUrl) {
      return res.status(400).json({ error: 'A valid HTTP(S) URL is required' });
    }

    const cached = readCache('readable', targetUrl);
    if (cached) return res.json(cached);

    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch content: ${response.statusText}`
      });
    }

    const html = await response.text();
    dom = new JSDOM(html, { url: targetUrl });

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return res.status(422).json({ error: 'Unable to extract readable content from the provided URL' });
    }

    const result = {
      url: targetUrl,
      title: article.title,
      byline: article.byline,
      excerpt: article.excerpt,
      length: article.length,
      siteName: article.siteName,
      content: article.content,
      textContent: article.textContent
    };

    writeCache('readable', targetUrl, result);
    res.json(result);
  } catch (error) {
    console.error('Readability error:', error);
    res.status(500).json({ error: 'Failed to create readable version', details: error.message });
  } finally {
    if (dom) {
      dom.window.close();
    }
  }
});

app.delete('/api/cache', (req, res) => {
  let deleted = 0;
  for (const subdir of ['scrape', 'readable']) {
    const dir = path.join(CACHE_DIR, subdir);
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        fs.unlinkSync(path.join(dir, file));
        deleted++;
      }
    } catch {}
  }
  res.json({ deleted });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Metascraper API server running on port ${PORT}`);
});
