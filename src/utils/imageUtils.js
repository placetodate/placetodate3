/**
 * Resizes an image file to a maximum width and height while maintaining aspect ratio.
 * @param {File} file - The image file to resize.
 * @param {number} maxWidth - The maximum width.
 * @param {number} maxHeight - The maximum height.
 * @param {number} quality - The quality of the output image (0 to 1).
 * @returns {Promise<string>} - A promise that resolves to the resized image as a Data URL.
 */
export const resizeImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No file provided"));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL(file.type, quality);
                resolve(dataUrl);
            };

            img.onerror = (error) => {
                reject(error);
            };
        };

        reader.onerror = (error) => {
            reject(error);
        };
    });
};
