// Max file size — 500KB (AppDB document limit)
export const MAX_FILE_SIZE = 5000 * 1024;

export const ALLOWED_TYPES = {
  // Images
  'image/jpeg':       { icon: '🖼️', label: 'JPEG',  preview: true  },
  'image/png':        { icon: '🖼️', label: 'PNG',   preview: true  },
  'image/gif':        { icon: '🖼️', label: 'GIF',   preview: true  },
  'image/webp':       { icon: '🖼️', label: 'WEBP',  preview: true  },
  // Documents
  'application/pdf':  { icon: '📄', label: 'PDF',   preview: false },
  'text/plain':       { icon: '📝', label: 'TXT',   preview: false },
  'text/csv':         { icon: '📊', label: 'CSV',   preview: false },
  // Office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                      { icon: '📝', label: 'DOCX',  preview: false },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                      { icon: '📊', label: 'XLSX',  preview: false },
};

export const isImageType = (mimeType) =>
  mimeType?.startsWith('image/');

export const formatFileSize = (bytes) => {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Convert File to base64 string
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result); // includes data:mime;base64,
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Download a base64 file
export const downloadBase64File = (base64Data, fileName) => {
  const link    = document.createElement('a');
  link.href     = base64Data;
  link.download = fileName;
  link.click();
};

// Validate file before sending
export const validateFile = (file) => {
  if (!file) return 'No file selected';
  if (!ALLOWED_TYPES[file.type])
    return `File type not supported. Use images, PDF, TXT, CSV, DOCX, or XLSX`;
  if (file.size > MAX_FILE_SIZE)
    return `File too large. Maximum size is 500KB`;
  return null; // valid
};