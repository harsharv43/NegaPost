# NegaPost Application Process & Architecture

This document outlines the technical workflow and sequence of events that occur within the NegaPost application, from user interaction to image processing architecture.

## 1. Application Architecture

NegaPost is a **client-side only** web application.
- **Frontend**: Standard HTML5, CSS3 (Vanilla), and JavaScript.
- **Containerization**: Docker & Nginx for serving static assets.
- **Processing Engine**: HTML5 Canvas API for pixel-level manipulation. No backend image processing is involved; everything happens in the user's browser for speed and privacy.

## 2. Sequence of Events

### A. Initialization
1.  **Loading**: The browser loads `index.html`, styles from `index.css`, and logic from `app.js`.
2.  **Event Binding**: Listeners are attached to:
    -   File Drop Zone (`dragover`, `drop`, `click`).
    -   File Input (`change`).
    -   Sliders/Inputs (Exposure, Contrast, Mask, RGB Channels) (`input`).
    -   Mode Selector (`change`).
    -   Download Button (`click`).

### B. Image Ingestion
When a user uploads a file:
1.  `FileReader` reads the file as a `DataURL`.
2.  A standard JavaScript `Image` object is created.
3.  Once the image loads, `context.drawImage()` draws the raw negative onto an off-screen or visible HTML5 Canvas.
4.  The application enters the "Processing" state.

### C. The Processing Pipeline (`processImage`)
This function runs whenever the image loads or a control changes. It manipulates raw pixel data (`ImageData.data`). The pipeline follows this strict order:

1.  **Reset**: The original image is redrawn to the canvas to ensure we always start from the source.
2.  **Data Extraction**: `ctx.getImageData()` pulls the raw RGBA array from the canvas.
3.  **Pixel Iteration**: A loop processes every pixel (steps of 4: R, G, B, Alpha).
4.  **Transfomation Steps**:
    *   **Step 1: Inversion**: The fundamental negative-to-positive step. $Value = 255 - Original$.
    *   **Step 2: Orange Mask Removal**: (skipped in B/W mode). Compensates for the orange base of color film by selectively dampening the blue and green channels based on the "Orange Mask" slider.
    *   **Step 3: RGB Channel Balance**: Multiplies Red, Green, and Blue channels individually by their respective user settings. This corrects color casts.
    *   **Step 4: Exposure**: Multiplies all channels by a scalar factor to brighten or darken the image.
    *   **Step 5: Contrast**: Applies a contrast algorithm: $Factor * (Value - 128) + 128$.
    *   **Step 6: Black & White Conversion**: (if B/W mode is active). Averages the R, G, and B values to create grayscale.
    *   **Step 7: Clamping**: Ensures final values remain between 0 and 255.
5.  **Rendering**: `ctx.putImageData()` pushes the processed pixels back to the canvas for the user to see.

### D. Export
1.  User clicks "Download".
2.  `canvas.toDataURL()` generates a PNG representation of the currently rendered canvas.
3.  A temporary `<a>` tag is created and clicked programmatically to trigger the browser's download behavior.

## 3. Development Workflow (Docker)

1.  **Volume Mounting**: The local directory is mounted to `/usr/share/nginx/html` in the container.
2.  **Hot Updates**: Edits to files on the host machine are immediately visible in the container.
3.  **Browser Refresh**: Since it's a static site, a simple browser refresh loads the new code from the mounted volume.
