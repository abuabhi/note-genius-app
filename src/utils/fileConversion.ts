
/**
 * Utility functions for file handling and conversion
 */

/**
 * Detect file type from File object or URL
 * @param file File object or URL string
 */
export const detectFileType = async (file: File | string): Promise<string> => {
  if (typeof file === 'string') {
    // URL case - try to fetch headers
    try {
      const response = await fetch(file, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      if (contentType) {
        return contentType;
      }
      
      // Fallback to extension
      const extension = file.split('.').pop()?.toLowerCase();
      return getTypeFromExtension(extension || '');
    } catch (error) {
      console.error('Error detecting file type from URL:', error);
      const extension = file.split('.').pop()?.toLowerCase();
      return getTypeFromExtension(extension || '');
    }
  } else {
    // File object case
    return file.type || getTypeFromExtension(file.name.split('.').pop()?.toLowerCase() || '');
  }
};

/**
 * Get MIME type from file extension
 */
export const getTypeFromExtension = (extension: string): string => {
  const extensionMap: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'txt': 'text/plain',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  
  return extensionMap[extension] || 'application/octet-stream';
};

/**
 * Check if a file is an image
 */
export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

/**
 * Check if a file is a PDF
 */
export const isPdfFile = (fileType: string): boolean => {
  return fileType === 'application/pdf';
};

/**
 * Validate file size
 * @param file File to validate
 * @param maxSizeInMB Maximum size in MB
 */
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Get appropriate max file size based on file type
 */
export const getMaxFileSizeForType = (fileType: string): number => {
  if (isPdfFile(fileType)) {
    return 50; // 50MB for PDFs
  } else if (isImageFile(fileType)) {
    return 10; // 10MB for images
  }
  return 5; // 5MB default for other files
};

/**
 * Generate a file preview URL
 */
export const generatePreviewUrl = (file: File): string => {
  if (isImageFile(file.type)) {
    return URL.createObjectURL(file);
  }
  
  // For PDFs and other files, we return empty string
  // UI should handle this and show appropriate icon
  return '';
};

/**
 * Clean up preview URLs
 */
export const revokePreviewUrl = (url: string): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
