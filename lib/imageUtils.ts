/**
 * Normalizes any image for upload, with special handling for iOS HEIC.
 *
 * Strategy:
 *  1. fetch(createObjectURL) → forces iOS to fully materialize lazy file data
 *  2. If fetched blob is still 0 bytes → throw (caller shows error to user)
 *  3. createObjectURL from fetched blob → <img> appended to DOM (HEIC trick)
 *  4. Resize to MAX_DIMENSION on the longest edge (keeps aspect ratio)
 *  5. canvas → WebP blob (fallback JPEG) → File
 *
 * Result is typically 80–200 KB even for 12-MP iPhone shots.
 */

/** Longest edge in pixels — 1280 keeps crisp quality while cutting size ×4+ */
const MAX_DIMENSION = 1280;

/** WebP quality (0–1). 0.82 ≈ visually lossless for ad thumbnails */
const WEBP_QUALITY = 0.82;

/** Returns true if this browser can encode WebP via canvas */
const supportsWebP = (): boolean => {
  try {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 1;
    return c.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
};

export const normalizeImageForUpload = async (
  file: File,
): Promise<File> => {
  // Step 1: Force iOS to actually read the file off disk
  const tempUrl = URL.createObjectURL(file);
  let sourceBlob: Blob;
  try {
    const res = await fetch(tempUrl);
    sourceBlob = await res.blob();
  } finally {
    URL.revokeObjectURL(tempUrl);
  }

  if (sourceBlob.size === 0) {
    throw new Error('EMPTY_FILE');
  }

  // Step 2: Canvas-decode via a blob URL (DOM-append trick for HEIC on iOS)
  const blobUrl = URL.createObjectURL(sourceBlob);

  return new Promise<File>((resolve, reject) => {
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(blobUrl);
      if (document.body.contains(img)) document.body.removeChild(img);
    };

    img.onerror = () => { cleanup(); reject(new Error('DECODE_ERROR')); };

    img.onload = () => {
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (!w || !h) { cleanup(); reject(new Error('ZERO_DIMENSIONS')); return; }

      // Step 3: Resize — scale down so the longest edge ≤ MAX_DIMENSION
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const scale = MAX_DIMENSION / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { cleanup(); reject(new Error('NO_CONTEXT')); return; }

      ctx.drawImage(img, 0, 0, w, h);
      cleanup();

      // Step 4: Encode — prefer WebP, fall back to JPEG
      const useWebP = supportsWebP();
      const mimeType = useWebP ? 'image/webp' : 'image/jpeg';
      const ext = useWebP ? 'webp' : 'jpg';
      const baseName = file.name.replace(/\.[^.]+$/, '');

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(new File([blob], `${baseName}.${ext}`, {
              type: mimeType,
              lastModified: Date.now(),
            }));
          } else {
            reject(new Error('EMPTY_BLOB'));
          }
        },
        mimeType,
        WEBP_QUALITY,
      );
    };

    // Critical: DOM append forces iOS Safari to fully decode HEIC
    img.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
    document.body.appendChild(img);
    img.src = blobUrl;
  });
};
