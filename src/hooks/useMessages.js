import { useState, useEffect, useRef } from "react";
import { ChatService } from "../services/chatService";
import { getChannel } from "../lib/ably";

export function useMessages(roomId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const channelRef = useRef(null);
  const pauseRef = useRef(false);

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
    channelRef.current = channel;

    // New message received
    channel.subscribe("new-message", (ablyMsg) => {
      const incoming = ablyMsg.data;
      setMessages((prev) => {
        const exists = prev.some(
          (m) =>
            m.id === incoming.id ||
            (m.sender === incoming.sender &&
              m.timestamp === incoming.timestamp &&
              m.message === incoming.message),
        );
        if (exists) return prev;
        return [...prev, incoming];
      });
    });

    // Message deleted — remove from all users instantly
    channel.subscribe("delete-message", (ablyMsg) => {
      const { id } = ablyMsg.data;
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    // Message edited — match by oldId, replace with full updated message
    channel.subscribe("edit-message", (ablyMsg) => {
      const { oldId, ...updated } = ablyMsg.data;
      setMessages((prev) => prev.map((m) => (m.id === oldId ? updated : m)));
    });
  };

  const unsubscribeAbly = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  };

  useEffect(() => {
    setLoading(true);
    setMessages([]);
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
    setMessages((prev) => [...prev, temp]);

    const saved = await ChatService.sendMessage(msg);

    // Replace temp with real saved message
    setMessages((prev) => prev.map((m) => (m.id === temp.id ? saved : m)));
  };

  // Local delete — Ably handles other users via subscribe above
  const deleteMessage = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  // Local edit — Ably handles other users via subscribe above
  const editMessage = (oldId, newText, newId) => {
    pauseRef.current = true;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === oldId
          ? { ...m, id: newId, message: newText, edited: "true" }
          : m,
      ),
    );
    setTimeout(() => {
      pauseRef.current = false;
    }, 3000);
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