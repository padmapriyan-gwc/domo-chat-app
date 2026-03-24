import { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/chatService';
import { getChannel } from '../lib/ably';
import { playNotificationSound } from '../utils/helpers';

export function useMessages(roomId, currentUser) {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [online, setOnline]         = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const channelRef                  = useRef(null);
  const typingTimeouts              = useRef({});
  const pauseRef                    = useRef(false);

  const loadHistory = async () => {
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

  const subscribeAbly = () => {
    const channel = getChannel(roomId);
    if (!channel) return; 
    channelRef.current = channel;

    // New message
    channel.subscribe('new-message', (ablyMsg) => {
      const incoming = ablyMsg.data;
      setMessages(prev => {
        const exists = prev.some(
          m => m.id === incoming.id ||
          (m.sender === incoming.sender &&
           m.timestamp === incoming.timestamp &&
           m.message === incoming.message)
        );
        if (exists) return prev;

        // Play sound if message is from someone else
        if (incoming.sender !== currentUser) {
          playNotificationSound();
        }

        return [...prev, incoming];
      });
    });

    // Delete message
    channel.subscribe('delete-message', (ablyMsg) => {
      const { id } = ablyMsg.data;
      setMessages(prev => prev.filter(m => m.id !== id));
    });

    // Edit message
    channel.subscribe('edit-message', (ablyMsg) => {
      const { oldId, ...updated } = ablyMsg.data;
      setMessages(prev =>
        prev.map(m => m.id === oldId ? updated : m)
      );
    });

    // Typing indicator
    channel.subscribe('typing', (ablyMsg) => {
      const { username } = ablyMsg.data;
      if (username === currentUser) return;

      // Add to typing list
      setTypingUsers(prev =>
        prev.includes(username) ? prev : [...prev, username]
      );

      // Clear after 3 seconds of no typing event
      if (typingTimeouts.current[username]) {
        clearTimeout(typingTimeouts.current[username]);
      }
      typingTimeouts.current[username] = setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== username));
        delete typingTimeouts.current[username];
      }, 3000);
    });
  };

  const unsubscribeAbly = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    Object.values(typingTimeouts.current).forEach(clearTimeout);
    typingTimeouts.current = {};
  };

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setTypingUsers([]);
    loadHistory();
    subscribeAbly();
    return () => unsubscribeAbly();
  }, [roomId]);

  const sendMessage = async (text, sender) => {
    const msg = {
      sender,
      message: text,
      timestamp: new Date().toISOString(),
      roomId,
    };
    const temp = { ...msg, id: `temp-${Date.now()}` };
    setMessages(prev => [...prev, temp]);

    const saved = await ChatService.sendMessage(msg);
    setMessages(prev =>
      prev.map(m => m.id === temp.id ? saved : m)
    );
  };

  const publishTyping = (username) => {
    if (channelRef.current) {
      channelRef.current.publish('typing', { username });
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const editMessage = (oldId, newText, newId) => {
    pauseRef.current = true;
    setMessages(prev =>
      prev.map(m =>
        m.id === oldId
          ? { ...m, id: newId, message: newText, edited: 'true' }
          : m
      )
    );
    setTimeout(() => { pauseRef.current = false; }, 3000);
  };

  return {
    messages,
    loading,
    online,
    typingUsers,
    sendMessage,
    publishTyping,
    deleteMessage,
    editMessage,
  };
}