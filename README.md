# NegaPost
Brings back the old memories to life by converting film negatives into vibrant positives directly in your browser.

## Features
- **Instant Conversion**: Drag and drop your negative scan to see it inverted immediately.
- **Color & B/W Support**: properly handles orange masks for color negatives.
- **Privacy Focus**: All processing happens locally in your browser; no images are uploaded to any server.

## Running Locally with Docker

You can host this application locally using Docker.

### Prerequisites
- Docker installed on your machine.

### Using Docker Compose (Recommended)
1. build and start the container:
   ```bash
   docker-compose up -d --build
   ```
   *Note: The configuration now mounts your local folder into the container, so any changes you make to `index.html`, `app.js`, or `index.css` will be reflected instantly upon refreshing the page.*

2. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```
3. To stop the server:
   ```bash
   docker-compose down
   ```

### Using Docker CLI
1. Build the image:
   ```bash
   docker build -t negapost .
   ```
2. Run the container:
   ```bash
   docker run -d -p 8080:80 --name negapost-app negapost
   ```
3. Access at `http://localhost:8080`
