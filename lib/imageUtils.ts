/**
 * Compresses and converts any image File to WebP format using the browser Canvas API.
 *
 * @param file      - The source image File (any format the browser can decode)
 * @param maxWidth  - Max width in pixels; image is scaled down proportionally (default 1200)
 * @param quality   - WebP quality 0–1 (default 0.82)
 * @returns         A new File with the `.webp` extension and `image/webp` MIME type
 */
export const compressToWebP = (
  file: File,
  maxWidth = 1200,
  quality = 0.82,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

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
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }
          // Build a new filename with .webp extension
          const baseName = file.name.replace(/\.[^.]+$/, '');
          const webpFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(webpFile);
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
};
