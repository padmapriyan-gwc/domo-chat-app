import domo from 'ryuu.js';

const FILE_BASE = '/domo/data-files/v1';

const getResponseFileId = (res) =>
  res?.id ??
  res?.fileId ??
  res?.dataFileId ??
  res?.currentRevision?.dataFileId ??
  null;

const buildFileURL = (fileId) => `${FILE_BASE}/${fileId}`;

export const uploadFileToDomo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await domo.post(
      `${FILE_BASE}?name=${encodeURIComponent(file.name)}&public=false`,
      formData,
      { contentType: 'multipart' },
    );

    const fileId = getResponseFileId(res);
    if (!fileId) {
      throw new Error('Missing file id in upload response');
    }

    return {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  } catch (err) {
    console.error('[DomoFileAPI] Upload failed:', err);
    throw new Error('File upload failed. Please try again.');
  }
};

export const getDomoFileURL = (fileId) => buildFileURL(fileId);

export const downloadDomoFile = async (fileId, fileName) => {
  try {
    const blob = await domo.get(buildFileURL(fileId), { responseType: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('[DomoFileAPI] Download failed:', err);
    throw new Error('Download failed. Please try again.');
  }
};

export const deleteDomoFile = async (fileId) => {
  try {
    await domo.delete(buildFileURL(fileId));
  } catch (err) {
    console.error('[DomoFileAPI] Delete failed:', err);
    // Non-critical cleanup.
  }
};
