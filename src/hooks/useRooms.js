import { useState, useEffect, useRef } from "react";
import { ChatService } from "../services/chatService";
import { getAbly, getChannel } from "../lib/ably";

export function useRooms(username, activeRoomId) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const channelRef = useRef(null);
  const roomChannels = useRef({});

  // Keep a ref of activeRoomId so Ably callbacks always
  // read the latest value — not the stale closure value
  const activeRoomIdRef = useRef(activeRoomId);
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  // Clear unread when activeRoom changes
  useEffect(() => {
    if (activeRoomId) {
      setUnreadCounts((prev) => ({ ...prev, [activeRoomId]: 0 }));
    }
  }, [activeRoomId]);

  // const subscribeRoomForUnread = (roomId) => {
  //   if (roomChannels.current[roomId]) return;

  //   const channel = getChannel(roomId);
  //   roomChannels.current[roomId] = channel;

  //   channel.subscribe('new-message', (ablyMsg) => {
  //     const incoming = ablyMsg.data;
  //     if (incoming.sender === username) return;

  //     // Use ref — always has the latest activeRoomId value
  //     if (activeRoomIdRef.current === roomId) return;

  //     setUnreadCounts(prev => ({
  //       ...prev,
  //       [roomId]: (prev[roomId] || 0) + 1,
  //     }));
  //   });
  // };

  const subscribeRoomForUnread = (roomId) => {
    if (roomChannels.current[roomId]) return;

    const channel = getChannel(roomId);
    if (!channel) return;
    roomChannels.current[roomId] = channel;

    // ✅ NEW MESSAGE
    channel.subscribe("new-message", (ablyMsg) => {
      const incoming = ablyMsg.data;

      if (incoming.sender === username) return;
      if (activeRoomIdRef.current === roomId) return;

      setUnreadCounts((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || 0) + 1,
      }));
    });

    // 🔥 FIX: HANDLE DELETE
    channel.subscribe("delete-message", () => {
      setUnreadCounts((prev) => ({
        ...prev,
        [roomId]: Math.max((prev[roomId] || 1) - 1, 0),
      }));
    });
  };

  const subscribeAbly = () => {
    if (!username) return; // ← add this guard
    const ably = getAbly(username);
    if (!ably) return; // ← add this guard
    const channel = ably.channels.get(`user-${username}`);
    channelRef.current = channel;

    channel.subscribe("new-room", (ablyMsg) => {
      const newRoom = ablyMsg.data;
      setRooms((prev) => {
        const exists = prev.some((r) => r.id === newRoom.id);
        if (exists) return prev;
        subscribeRoomForUnread(newRoom.id);
        return [...prev, newRoom];
      });
    });
  };

  const unsubscribeAbly = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    Object.values(roomChannels.current).forEach((ch) => ch.unsubscribe());
    roomChannels.current = {};
  };

  const loadRooms = async () => {
    try {
      const data = await ChatService.fetchRooms(username);
      setRooms(data);
      data.forEach((room) => subscribeRoomForUnread(room.id));
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearUnread = (roomId) => {
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
  };

  const addRoom = (room) => {
    setRooms((prev) => {
      const exists = prev.some((r) => r.id === room.id);
      if (exists) return prev;
      return [...prev, room];
    });
  };

  useEffect(() => {
    loadRooms();
    subscribeAbly();
    return () => unsubscribeAbly();
  }, [username]);

  return { rooms, loading, unreadCounts, clearUnread, addRoom };
}
