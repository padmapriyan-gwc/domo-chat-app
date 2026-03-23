import React, { useEffect, useState } from 'react';
import { ChatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

export const NewChatModal = ({ onClose, onRoomCreated }) => {
  const { user } = useAuth();
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    ChatService.fetchUsers().then(data => {
      setUsers(data.filter(u => u.username !== user.username));
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartDM = async (targetUsername) => {
    setCreating(true);
    try {
      const room = await ChatService.createDM(user.username, targetUsername);
      onRoomCreated(room);
      onClose();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Failed to start chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">New message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <input
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />

        <div className="max-h-64 overflow-y-auto space-y-1">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading users...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No users found</p>
          ) : (
            filtered.map(u => (
              <button
                key={u.id}
                onClick={() => handleStartDM(u.username)}
                disabled={creating}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-600
                                flex items-center justify-center text-sm font-semibold">
                  {u.username[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {u.username}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};