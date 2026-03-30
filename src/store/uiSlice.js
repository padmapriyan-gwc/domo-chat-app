import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_ROOM } from "../constants";

const initialState = {
  activeRoom: DEFAULT_ROOM,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveRoom(state, action) {
      state.activeRoom = action.payload;
    },
    resetUiState() {
      return initialState;
    },
  },
});

export const { setActiveRoom, resetUiState } = uiSlice.actions;
export default uiSlice.reducer;
