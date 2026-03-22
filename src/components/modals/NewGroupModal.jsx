import React, { useEffect, useState } from 'react';
import { ChatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

export const NewGroupModal = ({ onClose, onRoomCreated }) => {
  const { user } = useAuth();
  const [users, setUsers]       = useState([]);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
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

  const toggleUser = (username) => {
    setSelected(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return alert('Enter a group name');
    if (selected.length === 0) return alert('Select at least one member');
    setCreating(true);
    try {
      const members = [user.username, ...selected];
      const room = await ChatService.createGroup(groupName.trim(), members, user.username);
      onRoomCreated(room);
      onClose();
    } catch {
      alert('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">New group</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>

        <input
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                     focus:outline-none focus:ring-2 focus:ring-purple-400 mb-3"
          placeholder="Group name..."
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          autoFocus
        />

        <input
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                     focus:outline-none focus:ring-2 focus:ring-purple-400 mb-3"
          placeholder="Search members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {selected.map(u => (
              <span
                key={u}
                className="bg-purple-100 text-purple-700 text-xs px-2 py-1
                           rounded-full flex items-center gap-1"
              >
                {u}
                <button
                  onClick={() => toggleUser(u)}
                  className="text-purple-400 hover:text-purple-700 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No users found</p>
          ) : (
            filtered.map(u => (
              <button
                key={u.id}
                onClick={() => toggleUser(u.username)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl
                            transition-colors text-left
                            ${selected.includes(u.username)
                              ? 'bg-purple-50'
                              : 'hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                 text-sm font-semibold
                                 ${selected.includes(u.username)
                                   ? 'bg-purple-200 text-purple-700'
                                   : 'bg-gray-100 text-gray-500'}`}>
                  {u.username[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">{u.username}</span>
                {selected.includes(u.username) && (
                  <span className="ml-auto text-purple-500 text-sm">✓</span>
                )}
              </button>
            ))
          )}
        </div>

        <button
          onClick={handleCreate}
          disabled={creating || !groupName.trim() || selected.length === 0}
          className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-200
                     disabled:text-gray-400 text-white font-semibold py-2.5
                     rounded-xl transition-colors text-sm"
        >
          {creating ? 'Creating...' : `Create group (${selected.length + 1} members)`}
        </button>
      </div>
    </div>
  );
};