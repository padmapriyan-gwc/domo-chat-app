import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  rooms: [],
  loading: true,
  unreadCounts: {},
};

const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setRoomsLoading(state, action) {
      state.loading = action.payload;
    },
    setRooms(state, action) {
      state.rooms = action.payload;
    },
    upsertRoom(state, action) {
      const room = action.payload;
      const index = state.rooms.findIndex((item) => item.id === room.id);

      if (index === -1) {
        state.rooms.push(room);
        return;
      }

      state.rooms[index] = room;
    },
    removeRoom(state, action) {
      state.rooms = state.rooms.filter((room) => room.id !== action.payload);
      delete state.unreadCounts[action.payload];
    },
    incrementUnread(state, action) {
      const roomId = action.payload;
      state.unreadCounts[roomId] = (state.unreadCounts[roomId] || 0) + 1;
    },
    decrementUnread(state, action) {
      const roomId = action.payload;
      state.unreadCounts[roomId] = Math.max(
        (state.unreadCounts[roomId] || 0) - 1,
        0,
      );
    },
    clearUnread(state, action) {
      state.unreadCounts[action.payload] = 0;
    },
    resetRoomsState() {
      return initialState;
    },
  },
});

export const {
  setRoomsLoading,
  setRooms,
  upsertRoom,
  removeRoom,
  incrementUnread,
  decrementUnread,
  clearUnread,
  resetRoomsState,
} = roomsSlice.actions;

export default roomsSlice.reducer;
