import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number; // Max file size in MB
  maxWidthOrHeight?: number; // Max width or height for images
}

async function compressMedia(file: File, options: CompressionOptions = {}): Promise<File> {
  const {
    maxSizeMB = 1, // Default max size: 1MB
    maxWidthOrHeight = 1920, // Default max dimension for images
  } = options;

  // Check if file is an image based on MIME type
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    throw new Error('Unsupported file type. Only images are supported.');
  }

  try {
    // Compress image using browser-image-compression
    const compressedBlob = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
    });
    // Convert Blob to File
    return new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error(`Failed to compress image: ${error.message}`);
  }
}

export default compressMedia;