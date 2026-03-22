// import React, { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ChatService } from '../services/chatService';
// import { useAuth } from '../context/AuthContext';
// import { MessageBubble } from '../components/MessageBubble';
// import { MessageInput } from '../components/MessageInput';

// export default function ChatPage() {
//     const { user, logout } = useAuth();
//     const [messages, setMessages] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [online, setOnline] = useState(true);
//     const bottomRef = useRef(null);
//     const navigate = useNavigate();
//     const ROOM_ID = 'general';
//     const pausePollRef = useRef(false);

//     const loadMessages = async () => {
//         try {
//         const data = await ChatService.fetchMessages(ROOM_ID);
//         setMessages(data);
//         setOnline(true);
//         } catch {
//         setOnline(false);
//         } finally {
//         setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadMessages();
//         const interval = setInterval(loadMessages, 3000); // real-time poll
//         return () => clearInterval(interval);
//     }, []);

//     useEffect(() => {
//         bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     const handleSend = async (text) => {
//         const msg = {
//         sender: user.username,
//         message: text,
//         timestamp: new Date().toISOString(),
//         roomId: ROOM_ID,
//         };
//         // Optimistic update
//         const temp = { ...msg, id: `temp-${Date.now()}` };
//         setMessages(prev => [...prev, temp]);
//         await ChatService.sendMessage(msg);
//     };

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };

//     // Add these two handlers inside the ChatPage component:

// const handleDelete = (id) => {
//   setMessages((prev) => prev.filter((msg) => msg.id !== id));
// };

// const handleEdit = (id, newText) => {
//   setMessages((prev) =>
//     prev.map((msg) =>
//       msg.id === id ? { ...msg, message: newText, edited: true } : msg
//     )
//   );
// };

// // Then update the MessageBubble render inside your messages map:
// messages.map((msg) => (
//   <MessageBubble
//     key={msg.id}
//     msg={msg}
//     isOwn={msg.sender === user?.username}
//     onDelete={handleDelete}
//     onEdit={handleEdit}
//   />
// ))

//     return (
//         <div className="flex flex-col h-screen bg-gray-50">
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white shadow-md">
//             <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
//                 {user?.username?.[0]?.toUpperCase()}
//             </div>
//             <div>
//                 <p className="font-semibold text-sm">{user?.username}</p>
//                 <p className="text-xs text-blue-100 flex items-center gap-1">
//                 <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300' : 'bg-red-300'}`} />
//                 {online ? 'Live • updates every 3s' : 'Reconnecting...'}
//                 </p>
//             </div>
//             </div>
//             <button
//             onClick={handleLogout}
//             className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
//             >
//             Logout
//             </button>
//         </div>

//         {/* Room label */}
//         <div className="px-4 py-2 bg-white border-b border-gray-100 text-xs text-gray-400 font-medium">
//             # general
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto px-4 py-4">
//             {loading ? (
//             <div className="flex justify-center items-center h-full text-gray-400 text-sm">
//                 Loading messages...
//             </div>
//             ) : messages.length === 0 ? (
//             <div className="flex flex-col justify-center items-center h-full text-gray-400 text-sm gap-2">
//                 <span className="text-3xl">👋</span>
//                 No messages yet. Be the first!
//             </div>
//             ) : (
//             messages.map(msg => (
//                 <MessageBubble
//                 key={msg.id}
//                 msg={msg}
//                 isOwn={msg.sender === user?.username}
//                 />
//             ))
//             )}
//             <div ref={bottomRef} />
//         </div>

//         {/* Input */}
//         <MessageInput onSend={handleSend} />
//         </div>
//     );
// }

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const ROOM_ID = 'general';
  const pausePollRef = useRef(false); // ← controls polling pause

  const loadMessages = async () => {
    if (pausePollRef.current) return; // ← skip poll if editing
    try {
      const data = await ChatService.fetchMessages(ROOM_ID);
      setMessages(data);
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msg = {
      sender: user.username,
      message: text,
      timestamp: new Date().toISOString(),
      roomId: ROOM_ID,
    };
    const temp = { ...msg, id: `temp-${Date.now()}` };
    setMessages(prev => [...prev, temp]);
    await ChatService.sendMessage(msg);
  };

  const handleDelete = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

const handleEdit = (oldId, newText, newId) => {
  pausePollRef.current = true;
  setMessages(prev =>
    prev.map(msg =>
      msg.id === oldId
        ? { ...msg, id: newId, message: newText, edited: true } // ← swap id too
        : msg
    )
  );
  setTimeout(() => {
    pausePollRef.current = false;
  }, 3000); // give AppDB 3s to confirm before polling resumes
};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-500 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.username}</p>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-300' : 'bg-red-300'}`} />
              {online ? 'Live • updates every 3s' : 'Reconnecting...'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Room label */}
      <div className="px-4 py-2 bg-white border-b border-gray-100 text-xs text-gray-400 font-medium">
        # general
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-gray-400 text-sm gap-2">
            <span className="text-3xl">👋</span>
            No messages yet. Be the first!
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isOwn={msg.sender === user?.username}
              onDelete={handleDelete}  // ← was missing
              onEdit={handleEdit}      // ← was missing
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}