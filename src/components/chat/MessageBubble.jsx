import React, { useState } from 'react';
import { ChatService } from '../../services/chatService';
import { getUserColor } from '../../utils/helpers';
import { FileMessage } from './FileMessage';

export function MessageBubble({ msg, isOwn, isGrouped, onDelete, onEdit }) {
  const [isEditing, setIsEditing]     = useState(false);
  const [editText, setEditText]       = useState(msg.message);
  const [showActions, setShowActions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isFileMessage = msg.type === 'file';

const handleDelete = async () => {
  // Pass msg.fileId so Domo file storage gets cleaned up too
  await ChatService.deleteMessage(msg.id, msg.roomId, msg.fileId || null);
  onDelete(msg.id);
  setShowConfirm(false);
};

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      setIsEditing(false);
      const updated = await ChatService.editMessage(msg.id, editText.trim(), msg);
      onEdit(msg.id, editText.trim(), updated.id);
    } catch {
      setIsEditing(true);
    }
  };

  const { bg } = getUserColor(msg.sender);

  return (
    <div
      className={`flex flex-col mb-0.5
                  ${isOwn ? 'items-end' : 'items-start'}
                  ${!isGrouped ? 'mt-4' : 'mt-0.5'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Sender name + avatar */}
      {!isOwn && !isGrouped && (
        <div className="flex items-center gap-2 mb-1.5 ml-1">
          <div className={`w-7 h-7 rounded-full flex items-center
                          justify-center text-xs font-bold
                          text-white flex-shrink-0 ${bg}`}>
            {msg.sender?.[0]?.toUpperCase()}
          </div>
          <span className="text-gray-500 text-xs font-semibold">
            {msg.sender}
          </span>
        </div>
      )}

      <div className={`flex items-end gap-2
                      ${!isOwn ? 'ml-9' : ''}`}>

        {/* Action buttons — hide for file messages on edit */}
        {isOwn && showActions && !isEditing && !showConfirm && (
          <div className="flex gap-1 mb-1">
            {/* Only show edit for text messages */}
            {!isFileMessage && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-400 hover:text-gray-600
                          px-2 py-1 rounded-lg hover:bg-gray-100 transition-all"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              className="text-xs text-red-400 hover:text-red-500
                        px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
            >
              Delete
            </button>
          </div>
        )}

        {/* Delete confirm */}
        {showConfirm && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl
                          bg-red-50 border border-red-100">
            <span className="text-xs text-red-500">Delete?</span>
            <button onClick={handleDelete}
              className="text-xs text-red-500 font-bold hover:text-red-600">
              Yes
            </button>
            <button onClick={() => setShowConfirm(false)}
              className="text-xs text-gray-400 hover:text-gray-600">
              No
            </button>
          </div>
        )}

        {/* Edit mode — text only */}
        {isEditing && !isFileMessage ? (
          <div className="flex flex-col gap-2 w-64">
            <input
              className="px-3 py-2 rounded-xl border border-purple-200
                        text-sm text-gray-800 focus:outline-none
                        focus:ring-2 focus:ring-purple-300/50 bg-white"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="text-xs text-white font-semibold px-3 py-1
                          rounded-lg"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          !showConfirm && (
            <div>
              {/* File message */}
              {isFileMessage ? (
                <FileMessage msg={msg} isOwn={isOwn} />
              ) : (
                /* Text bubble */
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={isOwn ? {
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    color: '#fff',
                    borderBottomRightRadius: '6px',
                  } : {
                    background: '#f3f4f6',
                    color: '#1f2937',
                    borderBottomLeftRadius: '6px',
                  }}
                >
                  {msg.message}
                  {msg.edited === 'true' && (
                    <span className="text-xs opacity-50 ml-2">(edited)</span>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <p className={`text-xs mt-1 text-gray-400
                            ${isOwn ? 'text-right' : 'text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}