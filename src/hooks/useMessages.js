import { useState, useEffect, useRef } from "react";
import { ChatService } from "../services/chatService";
import { getChannel } from "../lib/ably";
import { playNotificationSound } from "../utils/helpers";

export function useMessages(roomId, currentUser) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);

  const channelRef = useRef(null);
  const typingTimeouts = useRef({});

  // 🔹 LOAD HISTORY
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

  // 🔹 SUBSCRIBE TO ABLY
  const subscribeAbly = () => {
    if (!roomId || !currentUser) return;

    // ❗ Prevent duplicate subscriptions
    if (channelRef.current) return;

    const channel = getChannel(roomId, currentUser);
    if (!channel) return;

    channelRef.current = channel;

    // ✅ NEW MESSAGE
    channel.subscribe("new-message", (ablyMsg) => {
      const incoming = ablyMsg.data;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === incoming.id);
        if (exists) return prev;

        if (incoming.sender !== currentUser) {
          playNotificationSound();
        }

        return [...prev, incoming];
      });
    });

    // ✅ DELETE
    channel.subscribe("delete-message", (ablyMsg) => {
      const { id } = ablyMsg.data;
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    // ✅ EDIT
    channel.subscribe("edit-message", (ablyMsg) => {
      const { oldId, ...updated } = ablyMsg.data;
      setMessages((prev) =>
        prev.map((m) => (m.id === oldId ? updated : m))
      );
    });

    // ✅ TYPING
    channel.subscribe("typing", (ablyMsg) => {
      const { username } = ablyMsg.data;
      if (username === currentUser) return;

      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username]
      );

      if (typingTimeouts.current[username]) {
        clearTimeout(typingTimeouts.current[username]);
      }

      typingTimeouts.current[username] = setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((u) => u !== username)
        );
        delete typingTimeouts.current[username];
      }, 3000);
    });
  };

  // 🔹 CLEANUP
  const unsubscribeAbly = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    Object.values(typingTimeouts.current).forEach(clearTimeout);
    typingTimeouts.current = {};
  };

  // 🔹 EFFECT (FIXED)
  useEffect(() => {
    if (!roomId || !currentUser) return;

    setLoading(true);
    setTypingUsers([]);

    loadHistory();
    subscribeAbly();

    return () => {
      unsubscribeAbly();
    };
  }, [roomId, currentUser]);

  // 🔥 SEND MESSAGE (CORRECT ORDER)
  const sendMessage = async (text, sender) => {
    const msg = {
      sender,
      message: text,
      timestamp: new Date().toISOString(),
      roomId,
    };

    // optimistic UI
    const temp = { ...msg, id: `temp-${Date.now()}` };
    setMessages((prev) => [...prev, temp]);

    // save to backend
    const saved = await ChatService.sendMessage(msg);

    // replace temp with real
    setMessages((prev) =>
      prev.map((m) => (m.id === temp.id ? saved : m))
    );

    // 🔥 REALTIME BROADCAST
    if (channelRef.current) {
      channelRef.current.publish("new-message", saved);
    }
  };

  const publishTyping = (username) => {
    if (channelRef.current) {
      channelRef.current.publish("typing", { username });
    }
  };

  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const editMessage = (oldId, newText, newId) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === oldId
          ? { ...m, id: newId, message: newText, edited: "true" }
          : m
      )
    );
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