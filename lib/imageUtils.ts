/**
 * Compresses and converts any image File to WebP format using the browser Canvas API.
 *
 * @param file      - The source image File (any format the browser can decode, incl. HEIC)
 * @param maxWidth  - Max width in pixels; image is scaled down proportionally (default 1200)
 * @param quality   - Encoding quality 0–1 (default 0.82)
 * @returns         A new File — WebP when the browser supports it, JPEG as fallback
 */
export const compressToWebP = (
  file: File,
  maxWidth = 1200,
  quality = 0.82,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Use readAsDataURL instead of createObjectURL — required for HEIC on iOS Safari
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Empty data URL'));
        return;
      }

      const img = new Image();

      img.onerror = () => reject(new Error('Failed to decode image'));

      img.onload = () => {
        // Calculate scaled dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const baseName = file.name.replace(/\.[^.]+$/, '');

        // Try WebP first
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

            // WebP not supported or produced an empty blob (older iOS Safari) — fall back to JPEG
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

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
};
