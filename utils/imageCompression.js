/**
 * Compresses an image file or base64 image string
 * @param {File|string} image - Image file or base64 string
 * @param {number} maxWidth - Maximum width (default: 1920)
 * @param {number} maxHeight - Maximum height (default: 1920)
 * @param {number} quality - JPEG quality 0-1 (default: 0.7)
 * @returns {Promise<string>} Compressed image as base64 string
 */
export async function compressImage(image, maxWidth = 1920, maxHeight = 1920, quality = 0.7) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (error) => {
        reject(new Error('Failed to load image: ' + error));
      };

      // Set image source (file or base64)
      if (image instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = (error) => {
          reject(new Error('Failed to read file: ' + error));
        };
        reader.readAsDataURL(image);
      } else if (typeof image === 'string') {
        // Already base64 string
        img.src = image;
      } else {
        reject(new Error('Invalid image format'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

