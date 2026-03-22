import { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/chatService';
import { POLL_INTERVAL_MESSAGES } from '../constants';

export function useMessages(roomId) {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [online, setOnline]       = useState(true);
  const pausePollRef              = useRef(false);

  const loadMessages = async () => {
    if (pausePollRef.current) return;
    try {
      const data = await ChatService.fetchMessages(roomId);
      setMessages(data);
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    loadMessages();
    const interval = setInterval(loadMessages, POLL_INTERVAL_MESSAGES);
    return () => clearInterval(interval);
  }, [roomId]);

  const sendMessage = async (text, sender) => {
    const msg = {
      sender,
      message: text,
      timestamp: new Date().toISOString(),
      roomId,
    };
    // Optimistic update
    const temp = { ...msg, id: `temp-${Date.now()}` };
    setMessages(prev => [...prev, temp]);
    await ChatService.sendMessage(msg);
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const editMessage = (oldId, newText, newId) => {
    pausePollRef.current = true;
    setMessages(prev =>
      prev.map(msg =>
        msg.id === oldId
          ? { ...msg, id: newId, message: newText, edited: 'true' }
          : msg
      )
    );
    setTimeout(() => { pausePollRef.current = false; }, 3000);
  };

  return {
    messages,
    loading,
    online,
    sendMessage,
    deleteMessage,
    editMessage,
  };
}