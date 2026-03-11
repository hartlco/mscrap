# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

mscrap is a Node.js/Express REST API that wraps [metascraper](https://metascraper.js.org/) and [@mozilla/readability](https://github.com/mozilla/readability) to extract metadata and readable content from URLs. Single-file server (`index.js`) with a static web UI (`public/index.html`).

## Development

```bash
npm install       # install dependencies
npm start         # run server on port 3000 (or PORT env var)
```

No test suite exists (`npm test` is a placeholder).

## Docker

```bash
docker compose up --build   # local build + run
docker compose up -d        # run from published image (hartlco/mscrap:latest)
```

Docker image is multi-arch (amd64/arm64), published to Docker Hub via GitHub Actions on version tags (`v*`).

## API Endpoints

- `POST /api/scrape` — extract metadata (author, title, description, image, etc.) from `{"url": "..."}`
- `POST /api/readable` — extract readable article content using Mozilla Readability from `{"url": "..."}`
- `GET /api/health` — health check

## Key Dependencies

- **metascraper** + plugins: metadata extraction
- **@mozilla/readability** + **jsdom**: article content extraction
- **express** v5, **cors**
