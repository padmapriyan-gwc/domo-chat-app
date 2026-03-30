import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  onlineUsers: [],
};

const presenceSlice = createSlice({
  name: "presence",
  initialState,
  reducers: {
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    addOnlineUser(state, action) {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser(state, action) {
      state.onlineUsers = state.onlineUsers.filter(
        (username) => username !== action.payload,
      );
    },
    resetPresenceState() {
      return initialState;
    },
  },
});

export const {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  resetPresenceState,
} = presenceSlice.actions;

export default presenceSlice.reducer;
