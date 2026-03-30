import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChatService } from "../services/chatService";
import { getAbly, getChannel } from "../lib/ably";
import {
  clearUnread as clearUnreadAction,
  decrementUnread,
  incrementUnread,
  removeRoom,
  setRooms,
  setRoomsLoading,
  upsertRoom,
} from "../store/roomsSlice";

export function useRooms(username, activeRoomId) {
  const dispatch = useDispatch();
  const rooms = useSelector((state) => state.rooms.rooms);
  const loading = useSelector((state) => state.rooms.loading);
  const unreadCounts = useSelector((state) => state.rooms.unreadCounts);

  const channelRef = useRef(null);
  const roomChannels = useRef({});

  const activeRoomIdRef = useRef(activeRoomId);
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    if (activeRoomId) {
      dispatch(clearUnreadAction(activeRoomId));
    }
  }, [activeRoomId, dispatch]);

  const subscribeRoomForUnread = useCallback(
    (roomId) => {
      if (!username || !roomId) return;
      if (roomChannels.current[roomId]) return;

      const channel = getChannel(roomId, username);
      if (!channel) return;

      roomChannels.current[roomId] = channel;

      const handleNewMessage = (ablyMsg) => {
        const incoming = ablyMsg.data;
        if (incoming.sender === username) return;
        if (activeRoomIdRef.current === roomId) return;

        dispatch(incrementUnread(roomId));
      };

      const handleDelete = (ablyMsg) => {
        const { id } = ablyMsg.data;
        if (!id) return;
        if (activeRoomIdRef.current === roomId) return;

        dispatch(decrementUnread(roomId));
      };

      channel.subscribe("new-message", handleNewMessage);
      channel.subscribe("delete-message", handleDelete);

      channel.on("attached", () => {
        console.log("Channel reattached:", roomId);
      });
    },
    [dispatch, username],
  );

  const unsubscribeAbly = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    Object.values(roomChannels.current).forEach((ch) => ch.unsubscribe());
    roomChannels.current = {};
  };

  useEffect(() => {
    if (!username) return;

    const subscribeAbly = () => {
      const ably = getAbly(username);
      if (!ably) return;

      const channel = ably.channels.get(`user-${username}`);
      channelRef.current = channel;

      channel.subscribe("new-room", (ablyMsg) => {
        const newRoom = ablyMsg.data;
        subscribeRoomForUnread(newRoom.id);
        dispatch(upsertRoom(newRoom));
      });

      channel.subscribe("room-updated", (ablyMsg) => {
        const updatedRoom = ablyMsg.data;
        const updatedMembers = Array.isArray(updatedRoom?.members)
          ? updatedRoom.members
          : [];

        if (!updatedMembers.includes(username)) {
          dispatch(removeRoom(updatedRoom.id));
          return;
        }

        subscribeRoomForUnread(updatedRoom.id);
        dispatch(upsertRoom(updatedRoom));
      });
    };

    const loadRooms = async () => {
      try {
        const data = await ChatService.fetchRooms(username);
        dispatch(setRooms(data));

        subscribeRoomForUnread("general");
        data.forEach((room) => subscribeRoomForUnread(room.id));
      } catch (err) {
        console.error("Failed to load rooms:", err);
      } finally {
        dispatch(setRoomsLoading(false));
      }
    };

    dispatch(setRoomsLoading(true));
    subscribeAbly();
    loadRooms();

    return () => unsubscribeAbly();
  }, [username, dispatch, subscribeRoomForUnread]);

  const clearUnread = (roomId) => {
    dispatch(clearUnreadAction(roomId));
  };

  const addRoom = (room) => {
    dispatch(upsertRoom(room));
  };

  return { rooms, loading, unreadCounts, clearUnread, addRoom };
}
