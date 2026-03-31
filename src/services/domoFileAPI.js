import domo from 'ryuu.js';

const FILE_BASE = '/domo/datastores/v1/files';

// Upload a file to Domo — returns { fileId, fileName, fileSize, fileType }
export const uploadFileToDomo = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const res = await domo.post(
      `${FILE_BASE}/`,
      arrayBuffer,
      {
        headers: {
          'Content-Type':        file.type,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
        },
        rawBuffer: true,
      }
    );

    return {
      fileId:   res.id || res.fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  } catch (err) {
    console.error('[DomoFileAPI] Upload failed:', err);
    throw new Error('File upload failed — please try again');
  }
};

// Get the URL to display/download a file
export const getDomoFileURL = (fileId) =>
  `/domo/datastores/v1/files/${fileId}/contents`;

// Download a file through Domo proxy
export const downloadDomoFile = async (fileId, fileName) => {
  try {
    const blob = await domo.get(
      `/domo/datastores/v1/files/${fileId}/contents`,
      { responseType: 'blob' }
    );
    const link    = document.createElement('a');
    link.href     = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('[DomoFileAPI] Download failed:', err);
    throw new Error('Download failed — please try again');
  }
};

// Delete a file from Domo storage
export const deleteDomoFile = async (fileId) => {
  try {
    await domo.delete(`/domo/datastores/v1/files/${fileId}`);
  } catch (err) {
    console.error('[DomoFileAPI] Delete failed:', err);
    // non-critical — don't throw
  }
};