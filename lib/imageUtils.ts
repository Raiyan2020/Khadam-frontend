/**
 * Compresses any image (including iPhone HEIC) and converts it to WebP.
 * Falls back to JPEG if the browser can't encode WebP from canvas.
 *
 * Key iOS Safari fix: HEIC files must be decoded via an <img> element that is
 * temporarily appended to the DOM — without this, naturalWidth/naturalHeight
 * stay 0 and canvas.toBlob produces an empty blob.
 *
 * @param file      - Source image File (HEIC, JPEG, PNG, WebP, …)
 * @param maxWidth  - Max width in px; height is scaled proportionally (default 1200)
 * @param quality   - Quality 0–1 for WebP/JPEG encoding (default 0.85)
 * @returns         A new File — WebP, or JPEG as fallback
 */
export const compressToWebP = (
  file: File,
  maxWidth = 1200,
  quality = 0.85,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) { reject(new Error('Empty data URL')); return; }

      const img = new Image();

      img.onerror = () => {
        // Clean up DOM node before rejecting
        if (document.body.contains(img)) document.body.removeChild(img);
        reject(new Error('Failed to decode image'));
      };

      img.onload = () => {
        // naturalWidth is 0 when iOS Safari hasn't fully decoded the image yet
        if (!img.naturalWidth || !img.naturalHeight) {
          if (document.body.contains(img)) document.body.removeChild(img);
          reject(new Error('Image decoded with zero dimensions'));
          return;
        }

        // ── Resize ──────────────────────────────────────────────────────────
        let { naturalWidth: width, naturalHeight: height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (document.body.contains(img)) document.body.removeChild(img);
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Remove the temporary DOM node now that drawing is done
        if (document.body.contains(img)) document.body.removeChild(img);

        const baseName = file.name.replace(/\.[^.]+$/, '');

        // ── Encode → WebP (fallback JPEG) ────────────────────────────────────
        canvas.toBlob(
          (webpBlob) => {
            if (webpBlob && webpBlob.size > 0) {
              resolve(
                new File([webpBlob], `${baseName}.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now(),
                }),
              );
              return;
            }

            // WebP encoding not supported → fall back to JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob && jpegBlob.size > 0) {
                  resolve(
                    new File([jpegBlob], `${baseName}.jpg`, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    }),
                  );
                } else {
                  reject(new Error('Canvas toBlob produced an empty result'));
                }
              },
              'image/jpeg',
              quality,
            );
          },
          'image/webp',
          quality,
        );
      };

      // ── Critical for HEIC on iOS Safari ─────────────────────────────────────
      // iOS must see the <img> in the DOM to fully decode HEIC; without this
      // naturalWidth stays 0 and canvas draw produces a blank/empty image.
      img.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
      document.body.appendChild(img);
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
};
