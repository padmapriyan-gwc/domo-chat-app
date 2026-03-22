import { useState, useEffect } from 'react';
import { ChatService } from '../services/chatService';
import { POLL_INTERVAL_ROOMS } from '../constants';

export function useRooms(username) {
  const [rooms, setRooms]     = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, POLL_INTERVAL_ROOMS);
    return () => clearInterval(interval);
  }, [username]);

  const addRoom = (room) => {
    setRooms(prev => [...prev, room]);
  };

  return { rooms, loading, addRoom };
}