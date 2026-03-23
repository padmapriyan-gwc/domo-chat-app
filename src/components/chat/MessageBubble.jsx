import React, { useState } from 'react';
import { ChatService } from '../../services/chatService';
import { Avatar } from '../common/Avatar';

export function MessageBubble({ msg, isOwn, isGrouped, onDelete, onEdit }) {
  const [isEditing, setIsEditing]     = useState(false);
  const [editText, setEditText]       = useState(msg.message);
  const [showActions, setShowActions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    await ChatService.deleteMessage(msg.id, msg.roomId);
    onDelete(msg.id);
    setShowConfirm(false);
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      setIsEditing(false);
      const updated = await ChatService.editMessage(
        msg.id, editText.trim(), msg
      );
      onEdit(msg.id, editText.trim(), updated.id);
    } catch {
      setIsEditing(true);
      alert('Edit failed — please try again');
    }
  };

  return (
    <div
      className={`
        flex flex-col mb-1
        ${isOwn ? 'items-end' : 'items-start'}
        ${!isGrouped ? 'mt-3' : ''}
        animate-in fade-in slide-in-from-bottom-2 duration-200
      `}
      onMouseEnter={() => isOwn && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Sender name + avatar — hidden when grouped */}
      {!isOwn && !isGrouped && (
        <div className="flex items-center gap-2 mb-1 ml-1">
          <Avatar name={msg.sender} size="sm" />
          <span className="text-xs text-gray-400 font-medium">
            {msg.sender}
          </span>
        </div>
      )}

      {/* Spacer to align grouped messages with avatar */}
      {!isOwn && isGrouped && (
        <div className="ml-9" />
      )}

      <div className={`flex items-end gap-2 ${isOwn ? '' : 'ml-9'}`}>

        {/* Edit / Delete buttons */}
        {isOwn && showActions && !isEditing && !showConfirm && (
          <div className="flex gap-1 mb-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs bg-gray-100 hover:bg-gray-200
                         text-gray-500 px-2 py-1 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="text-xs bg-red-50 hover:bg-red-100
                         text-red-400 px-2 py-1 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {/* Inline delete confirm */}
        {showConfirm && (
          <div className="flex items-center gap-2 mb-1 bg-red-50
                          border border-red-100 rounded-xl px-3 py-2">
            <span className="text-xs text-red-500 font-medium">
              Delete this message?
            </span>
            <button
              onClick={handleDelete}
              className="text-xs bg-red-500 hover:bg-red-600
                         text-white px-2 py-1 rounded-lg transition-colors"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs bg-gray-100 hover:bg-gray-200
                         text-gray-500 px-2 py-1 rounded-lg transition-colors"
            >
              No
            </button>
          </div>
        )}

        {/* Edit mode */}
        {isEditing ? (
          <div className="flex flex-col gap-2 max-w-xs w-full">
            <input
              className="px-3 py-2 rounded-xl border border-blue-300
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-blue-400 w-full"
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
                className="text-xs bg-blue-500 hover:bg-blue-600
                           text-white px-3 py-1 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          !showConfirm && (
            <div className={`
              max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm
              ${isOwn
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }
            `}>
              {msg.message}
              {msg.edited === 'true' && (
                <span className="text-xs opacity-60 ml-2">(edited)</span>
              )}
            </div>
          )
        )}
      </div>

      {/* Timestamp — only show on last message in group */}
      {!showConfirm && (
        <span className={`text-xs text-gray-400 mt-1
                          ${isOwn ? 'mr-1' : 'ml-10'}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
      )}
    </div>
  );
}