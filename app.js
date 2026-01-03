const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const emptyState = document.getElementById('empty-state');
const previewContainer = document.getElementById('preview-container');
const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');

let originalImage = null;

// Controls
const exposureInput = document.getElementById('exposure');
const contrastInput = document.getElementById('contrast');
const maskInput = document.getElementById('orange-mask');
const modeSelect = document.getElementById('mode');

// RGB Channels
const rInput = document.getElementById('channel-r');
const gInput = document.getElementById('channel-g');
const bInput = document.getElementById('channel-b');

// Event Listeners
dropArea.addEventListener('click', () => fileInput.click());

// Keyboard accessibility for drop zone
dropArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
    }
});

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--primary)';
});
dropArea.addEventListener('dragleave', () => {
    dropArea.style.borderColor = 'var(--glass-border)';
});
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = 'var(--glass-border)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

const controls = [
    { range: exposureInput, num: document.getElementById('num-exposure') },
    { range: contrastInput, num: document.getElementById('num-contrast') },
    { range: maskInput, num: document.getElementById('num-mask') },
    { range: rInput, num: document.getElementById('num-channel-r') },
    { range: gInput, num: document.getElementById('num-channel-g') },
    { range: bInput, num: document.getElementById('num-channel-b') }
];

modeSelect.addEventListener('change', () => {
    if (originalImage) processImage();
});

controls.forEach(({ range, num }) => {
    // Slider -> Number & Process
    range.addEventListener('input', () => {
        num.value = range.value;
        if (originalImage) processImage();
    });

    // Number -> Slider & Process
    num.addEventListener('input', () => {
        range.value = num.value;
        if (originalImage) processImage();
    });
});

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please upload a valid image file (JPEG, PNG, etc.)');
        return;
    }

    // Validate file size (limit to 50MB to prevent browser crashes)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        showError('Image file is too large. Please upload an image smaller than 50MB.');
        return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
        showError('Failed to read the image file. Please try again.');
    };

    reader.onload = (e) => {
        const img = new Image();

        img.onerror = () => {
            showError('Failed to load the image. The file may be corrupted.');
        };

        img.onload = () => {
            // Validate image dimensions (prevent extremely large images)
            const maxDimension = 10000;
            if (img.width > maxDimension || img.height > maxDimension) {
                showError(`Image dimensions too large. Maximum ${maxDimension}x${maxDimension} pixels.`);
                return;
            }

            originalImage = img;
            emptyState.style.display = 'none';
            previewContainer.style.display = 'block';
            processImage();
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

function processImage() {
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const exposure = parseFloat(exposureInput.value);
    const contrast = parseFloat(contrastInput.value);
    const mask = parseFloat(maskInput.value);
    const isBW = modeSelect.value === 'bw';

    const rVal = parseFloat(rInput.value);
    const gVal = parseFloat(gInput.value);
    const bVal = parseFloat(bInput.value);

    // Simplified Orange Mask Removal (Basic heuristic)
    // Film base is usually R: 0.9, G: 0.5, B: 0.2 (normalized)
    // We adjust these ratios to neutralize the orange mask
    // Higher mask values increase the correction strength
    const ORANGE_MASK_GREEN_FACTOR = 0.5;
    const ORANGE_MASK_BLUE_FACTOR = 0.2;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 1. Invert
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;

        // 2. Orange mask removal for color negatives
        if (!isBW) {
            // Red channel typically doesn't need correction
            g = g / (ORANGE_MASK_GREEN_FACTOR + (ORANGE_MASK_GREEN_FACTOR * mask));
            b = b / (ORANGE_MASK_BLUE_FACTOR + (ORANGE_MASK_BLUE_FACTOR * mask));
        }

        // 3. RGB Channel Adjustment (Post-Inversion)
        if (!isBW) {
            r *= rVal;
            g *= gVal;
            b *= bVal;
        }

        // 4. Exposure
        r *= exposure;
        g *= exposure;
        b *= exposure;

        // 5. Contrast
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        if (isBW) {
            const avg = (r + g + b) / 3;
            r = g = b = avg;
        }

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imageData, 0, 0);
}

document.getElementById('download-btn').addEventListener('click', () => {
    if (!originalImage) return;
    const link = document.createElement('a');
    link.download = 'negapost-memory.png';
    link.href = canvas.toDataURL();
    link.click();
});
