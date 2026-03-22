// import React from 'react';

// export const MessageBubble = ({ msg, isOwn }) => (
//   <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
//     {!isOwn && (
//       <span className="text-xs text-gray-400 mb-1 ml-1 font-medium">{msg.sender}</span>
//     )}
//     <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm
//       ${isOwn
//         ? 'bg-blue-500 text-white rounded-br-none'
//         : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
//       {msg.message}
//     </div>
//     <span className="text-xs text-gray-400 mt-1 mx-1">
//       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//     </span>
//   </div>
// );

import React, { useState } from 'react';
import { ChatService } from '../services/chatService';

export const MessageBubble = ({ msg, isOwn, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(msg.message);
  const [showActions, setShowActions] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Delete this message?')) {
      await ChatService.deleteMessage(msg.id);
      onDelete(msg.id);
    }
  };

const handleEdit = async () => {
  if (!editText.trim()) return;

  try {
    setIsEditing(false);

    // API now returns the new document with a new id
    const updated = await ChatService.editMessage(msg.id, editText.trim(), msg);

    // Pass both old id and the full updated doc up
    onEdit(msg.id, editText.trim(), updated.id);

  } catch (err) {
    console.error('Edit failed:', err);
    setIsEditing(true);
    alert('Edit failed — please try again');
  }
};

  return (
    <div
      className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}
      onMouseEnter={() => isOwn && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Sender name */}
      {!isOwn && (
        <span className="text-xs text-gray-400 mb-1 ml-1 font-medium">
          {msg.sender}
        </span>
      )}

      {/* Message bubble + action buttons */}
      <div className="flex items-end gap-2">

        {/* Edit / Delete buttons — only your messages, shown on hover */}
        {isOwn && showActions && !isEditing && (
          <div className="flex gap-1 mb-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-500
                         px-2 py-1 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-400
                         px-2 py-1 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        )}

        {/* Bubble */}
        {isEditing ? (
          /* Edit mode */
          <div className="flex flex-col gap-2 max-w-xs">
            <input
              className="px-3 py-2 rounded-xl border border-blue-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
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
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white
                           px-3 py-1 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          /* Normal bubble */
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm shadow-sm
              ${isOwn
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }`}
          >
            {msg.message}
            {msg.edited && (
              <span className="text-xs opacity-60 ml-2">(edited)</span>
            )}
          </div>
        )}
      </div>

      {/* Timestamp */}
      <span className="text-xs text-gray-400 mt-1 mx-1">
        {new Date(msg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  );
};