import React, { useState } from 'react';
import { isImageType, formatFileSize, downloadBase64File, ALLOWED_TYPES } from '../../utils/fileHelper';

export function FileMessage({ msg, isOwn }) {
  const [imgError, setImgError]     = useState(false);
  const [expanded, setExpanded]     = useState(false);

  const isImage = isImageType(msg.fileType) && !imgError;
  const info    = ALLOWED_TYPES[msg.fileType] || { icon: '📎', label: 'File' };

  const handleDownload = () => {
    downloadBase64File(msg.fileData, msg.fileName);
  };

  if (isImage) {
    return (
      <div className="max-w-xs">
        {/* Image preview */}
        <div
          className={`relative rounded-2xl overflow-hidden cursor-pointer
                       border-2 transition-all
                       ${isOwn ? 'border-purple-300' : 'border-gray-200'}`}
          onClick={() => setExpanded(!expanded)}
        >
          <img
            src={msg.fileData}
            alt={msg.fileName}
            className={`w-full object-cover transition-all
                        ${expanded ? 'max-h-80' : 'max-h-40'}`}
            onError={() => setImgError(true)}
          />
          {/* Expand hint */}
          <div className="absolute bottom-2 right-2 bg-black/40 text-white
                          text-xs px-2 py-0.5 rounded-full">
            {expanded ? 'Click to collapse' : 'Click to expand'}
          </div>
        </div>

        {/* File name + download */}
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className={`text-xs truncate max-w-[160px]
                            ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
            {msg.fileName}
          </span>
          <button
            onClick={handleDownload}
            className={`text-xs font-semibold ml-2 flex-shrink-0
                        hover:underline transition-all
                        ${isOwn ? 'text-purple-200' : 'text-purple-500'}`}
          >
            Download
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
      {/* File icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                       text-xl flex-shrink-0
                       ${isOwn ? 'bg-white/20' : 'bg-purple-50'}`}>
        {info.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate
                       ${isOwn ? 'text-white' : 'text-gray-800'}`}>
          {msg.fileName}
        </p>
        <p className={`text-xs
                       ${isOwn ? 'text-purple-200' : 'text-gray-400'}`}>
          {info.label} · {formatFileSize(msg.fileSize)}
        </p>
      </div>

      {/* Download arrow */}
      <svg className={`w-4 h-4 flex-shrink-0
                       ${isOwn ? 'text-purple-200' : 'text-purple-400'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </div>
  );
}