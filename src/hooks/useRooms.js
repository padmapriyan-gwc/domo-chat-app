import { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/chatService';
import { getAbly } from '../lib/ably';

export function useRooms(username) {
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const channelRef            = useRef(null);

  const loadRooms = async () => {
    try {
      const data = await ChatService.fetchRooms(username);
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeAbly = () => {
    const channel = getAbly().channels.get(`user-${username}`);
    channelRef.current = channel;

    channel.subscribe('new-room', (ablyMsg) => {
      const newRoom = ablyMsg.data;
      setRooms(prev => {
        const exists = prev.some(r => r.id === newRoom.id);
        if (exists) return prev;
        return [...prev, newRoom];
      });
    });
  };

  const unsubscribeAbly = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  };

  useEffect(() => {
    loadRooms();
    subscribeAbly();
    return () => unsubscribeAbly();
  }, [username]);

  const addRoom = (room) => {
    setRooms(prev => {
      const exists = prev.some(r => r.id === room.id);
      if (exists) return prev;
      return [...prev, room];
    });
  };

  return { rooms, loading, addRoom };
}