/**
 * Utility to compress and optimize images before storing in localStorage or IndexedDB.
 * Resizes large photos to optimal dimensions and converts to compressed WebP/JPEG,
 * reducing multi-megabyte uploads down to ~50-150KB while preserving high visual quality.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<{ dataUrl: string; originalSizeKb: number; compressedSizeKb: number }> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    // If already an SVG or tiny image (< 30KB), return as data URL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || '';
        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb: Math.round(dataUrl.length / 1024),
        });
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo SVG.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();

      img.onerror = () => reject(new Error('Erro ao decodificar a imagem.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate scaling
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.max(1, Math.round(width * ratio));
            height = Math.max(1, Math.round(height * ratio));
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve({
              dataUrl: rawDataUrl,
              originalSizeKb,
              compressedSizeKb: Math.round(rawDataUrl.length / 1024),
            });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Try webp first
          let compressed = canvas.toDataURL('image/webp', quality);
          // If browser didn't produce webp, fallback to jpeg
          if (!compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/jpeg', quality);
          }

          const compressedSizeKb = Math.round(compressed.length / 1024);
          resolve({
            dataUrl: compressed,
            originalSizeKb,
            compressedSizeKb,
          });
        } catch (err) {
          console.warn('Falha na compressão do canvas, usando original:', err);
          resolve({
            dataUrl: rawDataUrl,
            originalSizeKb,
            compressedSizeKb: Math.round(rawDataUrl.length / 1024),
          });
        }
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
