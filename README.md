# Metascraper API

A REST API and web interface that wraps the [metascraper.js.org](https://metascraper.js.org/) package to extract metadata from websites.

## Features

- REST API endpoint to scrape website metadata
- Web interface for testing the API
- Docker support with docker-compose
- Health check endpoint
- CORS enabled for cross-origin requests

## Installation

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`

### Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker compose up --build
   ```

The application will be available at `http://localhost:3000`

## API Usage

### Scrape Metadata

**POST** `/api/scrape`

Request body:
```json
{
  "url": "https://example.com"
}
```

Response:
```json
{
  "author": "Author Name",
  "date": "2023-01-01",
  "description": "Website description",
  "image": "https://example.com/image.jpg",
  "logo": "https://example.com/logo.png",
  "publisher": "Publisher Name",
  "title": "Page Title",
  "url": "https://example.com"
}
```

### Health Check

**GET** `/api/health`

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Web Interface

Visit `http://localhost:3000` in your browser to use the web interface for testing the API.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (default: development)

## Docker Commands

```bash
# Build the image
docker compose build

# Run the container
docker compose up

# Run in background
docker compose up -d

# Stop the container
docker compose down
```

## Example with curl

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/microlinkhq/metascraper"}'
```