import React, { useRef, useState } from 'react';
import { formatFileSize, validateFile } from '../../utils/fileHelper';

export function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const typingThrottle = useRef(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!typingThrottle.current) {
      onTyping?.();
      typingThrottle.current = setTimeout(() => {
        typingThrottle.current = null;
      }, 2000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      e.target.value = '';
      return;
    }

    setFileError('');
    setPendingFile(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (uploading) return;

    if (pendingFile) {
      try {
        setUploading(true);
        setFileError('');
        await onSend('', pendingFile);
        setPendingFile(null);
        setText('');
      } catch (error) {
        setFileError(error?.message || 'File upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
      return;
    }

    const nextText = text.trim();
    if (!nextText) return;

    try {
      setUploading(true);
      await onSend(nextText, null);
      setText('');
      setFileError('');
    } catch (error) {
      setFileError(error?.message || 'Message send failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const canSend = Boolean(pendingFile || text.trim());

  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100">
      {pendingFile && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 bg-purple-50
                     border-b border-purple-100"
        >
          <div
            className="w-8 h-8 rounded-lg bg-purple-100 flex items-center
                       justify-center text-base flex-shrink-0"
          >
            {pendingFile.type.startsWith('image/') ? '[img]' : '[file]'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {pendingFile.name}
            </p>
            <p className="text-xs text-gray-400">
              {formatFileSize(pendingFile.size)}
            </p>
          </div>
          <button
            onClick={() => setPendingFile(null)}
            disabled={uploading}
            className="w-6 h-6 flex items-center justify-center text-gray-400
                       hover:text-red-500 hover:bg-red-50 rounded-lg
                       transition-all text-lg flex-shrink-0 disabled:opacity-40"
          >
            x
          </button>
        </div>
      )}

      {fileError && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <p className="text-xs text-red-500">{fileError}</p>
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.txt,.csv,.docx,.xlsx"
          onChange={handleFileSelect}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`w-9 h-9 flex items-center justify-center rounded-xl
                      transition-all flex-shrink-0 disabled:opacity-40
                      ${
                        pendingFile
                          ? 'text-purple-500 bg-purple-50'
                          : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
                      }`}
          title="Attach file (max 50MB)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        <div
          className="flex-1 flex items-center gap-2 px-4 py-2.5
                     rounded-2xl border border-gray-200 bg-gray-50
                     focus-within:bg-white focus-within:border-purple-200
                     focus-within:ring-2 focus-within:ring-purple-100
                     transition-all"
        >
          <input
            className="flex-1 text-sm text-gray-800 bg-transparent
                       focus:outline-none placeholder-gray-400 min-w-0"
            value={text}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && !pendingFile && handleSend()}
            placeholder={pendingFile ? 'Add a caption...' : 'Send a Message'}
            disabled={uploading}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend || uploading}
          className="px-4 py-2.5 rounded-xl text-sm font-bold
                     transition-all duration-150 flex-shrink-0
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:opacity-90 active:scale-95"
          style={{
            background:
              canSend && !uploading
                ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                : '#e5e7eb',
            color: canSend && !uploading ? '#fff' : '#9ca3af',
          }}
        >
          {uploading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
