import React, { useState } from 'react';
import { isImageType, formatFileSize, ALLOWED_TYPES } from '../../utils/fileHelper';
import { getDomoFileURL, downloadDomoFile } from '../../services/domoFileAPI';

export function FileMessage({ msg, isOwn }) {
  const [imgError, setImgError]       = useState(false);
  const [expanded, setExpanded]       = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isImage  = isImageType(msg.fileType) && !imgError;
  const info     = ALLOWED_TYPES[msg.fileType] || { icon: '📎', label: 'File' };
  const imageURL = msg.fileId ? getDomoFileURL(msg.fileId) : null;

  const handleDownload = async () => {
    if (!msg.fileId) return;
    setDownloading(true);
    try {
      await downloadDomoFile(msg.fileId, msg.fileName);
    } catch {
      alert('Download failed — please try again');
    } finally {
      setDownloading(false);
    }
  };

  if (isImage && imageURL) {
    return (
      <div className="max-w-xs">
        <div
          className={`relative rounded-2xl overflow-hidden cursor-pointer
                       border-2 transition-all
                       ${isOwn ? 'border-purple-300' : 'border-gray-200'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <img
            src={imageURL}
            alt={msg.fileName}
            className={`w-full object-cover transition-all
                        ${expanded ? 'max-h-80' : 'max-h-40'}`}
            onError={() => setImgError(true)}
          />
          <div className="absolute bottom-2 right-2 bg-black/40 text-white
                          text-xs px-2 py-0.5 rounded-full">
            {expanded ? 'Collapse' : 'Expand'}
          </div>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className={`text-xs truncate max-w-[160px]
                            ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
            {msg.fileName}
          </span>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`text-xs font-semibold ml-2 flex-shrink-0
                        hover:underline disabled:opacity-40
                        ${isOwn ? 'text-purple-200' : 'text-purple-500'}`}
          >
            {downloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>
    );
  }

  // Non-image file
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl
                  max-w-xs cursor-pointer hover:opacity-90 transition-all
                  ${isOwn
                    ? 'bg-purple-400/30'
                    : 'bg-gray-100 border border-gray-200'}`}
      onClick={handleDownload}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center
                       justify-center text-xl flex-shrink-0
                       ${isOwn ? 'bg-white/20' : 'bg-purple-50'}`}>
        {downloading ? (
          <svg className="w-5 h-5 animate-spin text-purple-400"
            fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : info.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate
                       ${isOwn ? 'text-white' : 'text-gray-800'}`}>
          {msg.fileName}
        </p>
        <p className={`text-xs ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
          {info.label} · {formatFileSize(msg.fileSize)}
        </p>
      </div>
      <svg className={`w-4 h-4 flex-shrink-0
                       ${isOwn ? 'text-purple-200' : 'text-purple-400'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </div>
  );
}