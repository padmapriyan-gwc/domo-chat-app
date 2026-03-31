export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB — Domo file API, no 500KB limit

export const ALLOWED_TYPES = {
  'image/jpeg':       { icon: '🖼️', label: 'JPEG',  preview: true  },
  'image/png':        { icon: '🖼️', label: 'PNG',   preview: true  },
  'image/gif':        { icon: '🖼️', label: 'GIF',   preview: true  },
  'image/webp':       { icon: '🖼️', label: 'WEBP',  preview: true  },
  'application/pdf':  { icon: '📄', label: 'PDF',   preview: false },
  'text/plain':       { icon: '📝', label: 'TXT',   preview: false },
  'text/csv':         { icon: '📊', label: 'CSV',   preview: false },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                      { icon: '📝', label: 'DOCX',  preview: false },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                      { icon: '📊', label: 'XLSX',  preview: false },
};

export const isImageType = (mimeType) => mimeType?.startsWith('image/');

export const formatFileSize = (bytes) => {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Validate file before sending
export const validateFile = (file) => {
  if (!file) return 'No file selected';
  if (!ALLOWED_TYPES[file.type])
    return 'File type not supported. Use images, PDF, TXT, CSV, DOCX, or XLSX';
  if (file.size > MAX_FILE_SIZE)
    return 'File too large. Maximum size is 50MB';
  return null;
};

// REMOVED: fileToBase64 — no longer needed, Domo API handles upload directly
// REMOVED: downloadBase64File — replaced by Domo download