# Changelog

## [Critical Fixes] - 2026-01-03

### 🔒 Security & Performance
- **Added `.dockerignore`**: Prevents sensitive files (.git, .env, logs) from being copied into Docker images
- **File size validation**: Added 50MB limit to prevent browser crashes from oversized images
- **Image dimension validation**: Maximum 10,000x10,000 pixels to prevent memory issues

### 🐛 Bug Fixes
- **Fixed HTML structure**: Corrected unclosed `<div>` tag that was nesting the download button incorrectly
- **Fixed orange mask algorithm**: Removed unused `rCorr` variable and properly implemented correction factors
- **Fixed duplicate comment**: Changed "4. Contrast" to "5. Contrast" in processing pipeline
- **Fixed drag-and-drop border**: Border now properly resets after dropping a file

### ♿ Accessibility Improvements
- **Added ARIA labels**: All interactive elements now have descriptive labels for screen readers
- **Keyboard navigation**: Drop zone now responds to Enter and Space keys
- **Focus states**: Added visible focus outlines for all interactive elements (compliant with WCAG 2.1)
- **SVG accessibility**: Added `aria-hidden="true"` to decorative icons

### 🎯 Error Handling
- **Comprehensive validation**: File type, size, and dimension checks before processing
- **User-friendly error messages**: Toast notifications for all error conditions
- **Graceful error recovery**: Proper error handlers for FileReader and Image loading
- **Auto-dismissing notifications**: Errors automatically disappear after 5 seconds

### 🎨 UI/UX Enhancements
- **Error notification system**: Smooth slide-in/slide-out animations
- **Better user feedback**: Clear error messages for all failure scenarios
- **Improved code organization**: Extracted magic numbers into named constants

### 📝 Code Quality
- **Better comments**: Clarified orange mask algorithm with proper documentation
- **Named constants**: Replaced magic numbers with `ORANGE_MASK_GREEN_FACTOR` and `ORANGE_MASK_BLUE_FACTOR`
- **Consistent formatting**: Improved code readability throughout

---

## Testing Recommendations

After these changes, please test:
1. ✅ Upload a valid negative image (should work normally)
2. ✅ Try to upload a non-image file (should show error)
3. ✅ Try to upload a very large file >50MB (should show error)
4. ✅ Use keyboard navigation (Tab to drop zone, press Enter/Space)
5. ✅ Drag and drop an image (border should highlight and reset)
6. ✅ Test all sliders and controls (should work as before)
7. ✅ Download the processed image (should work as before)

---

## Next Steps (Priority 2 - UX Improvements)

When ready, we can implement:
- Debouncing for real-time slider updates
- Reset button to restore default values
- Loading indicator for large images
- Mobile responsive design
- Before/after comparison view
