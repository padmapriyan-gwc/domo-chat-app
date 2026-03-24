import { useState, useEffect, useRef } from "react";
import { ChatService } from "../services/chatService";
import { getAbly, getChannel } from "../lib/ably";

export function useRooms(username, activeRoomId) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});

  const channelRef = useRef(null);
  const roomChannels = useRef({});

  // keep latest active room
  const activeRoomIdRef = useRef(activeRoomId);
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  // reset unread when opening room
  useEffect(() => {
    if (activeRoomId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [activeRoomId]: 0,
      }));
    }
  }, [activeRoomId]);

  // 🔥 SUBSCRIBE
  const subscribeRoomForUnread = (roomId) => {
    if (!username || !roomId) return;

    if (roomChannels.current[roomId]) return;

    const channel = getChannel(roomId, username);
    if (!channel) return;

    roomChannels.current[roomId] = channel;

    // ✅ NEW MESSAGE
    const handleNewMessage = (ablyMsg) => {
      const incoming = ablyMsg.data;

      console.log("UNREAD EVENT:", incoming);

      if (incoming.sender === username) return;
      if (activeRoomIdRef.current === roomId) return;

      setUnreadCounts((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || 0) + 1,
      }));
    };

    // 🔥 FIXED DELETE HANDLER
    const handleDelete = (ablyMsg) => {
      const deleted = ablyMsg.data;

      if (!deleted) return;

      // ❗ ignore own deletes
      if (deleted.sender === username) return;

      // ❗ ignore active room
      if (activeRoomIdRef.current === roomId) return;

      setUnreadCounts((prev) => ({
        ...prev,
        [roomId]: Math.max((prev[roomId] || 0) - 1, 0),
      }));
    };

    channel.subscribe("new-message", handleNewMessage);
    channel.subscribe("delete-message", handleDelete);

    // reconnect log (no logic change)
    channel.on("attached", () => {
      console.log("Channel reattached:", roomId);
    });
  };

  // 🔹 user channel
  const subscribeAbly = () => {
    if (!username) return;

    const ably = getAbly(username);
    if (!ably) return;

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

  // 🔹 cleanup
  const unsubscribeAbly = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    Object.values(roomChannels.current).forEach((ch) => {
      ch.unsubscribe();
    });

    roomChannels.current = {};
  };

  // 🔹 load rooms
  const loadRooms = async () => {
    try {
      const data = await ChatService.fetchRooms(username);
      setRooms(data);

      data.forEach((room) => {
        subscribeRoomForUnread(room.id);
      });
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 main effect
  useEffect(() => {
    if (!username) return;

    loadRooms();
    subscribeAbly();

    return () => unsubscribeAbly();
  }, [username]);

  // 🔹 helpers
  const clearUnread = (roomId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: 0,
    }));
  };

  const addRoom = (room) => {
    setRooms((prev) => {
      const exists = prev.some((r) => r.id === room.id);
      if (exists) return prev;
      return [...prev, room];
    });
  };

  return {
    rooms,
    loading,
    unreadCounts,
    clearUnread,
    addRoom,
  };
}