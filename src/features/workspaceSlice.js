import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../lib/api";

export const loadWorkspaces = createAsyncThunk("workspace/load", api.getWorkspaces);

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: { workspaces: [], currentWorkspace: null, loading: true, error: null },
  reducers: {
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = state.workspaces.find((workspace) => workspace.id === action.payload) || null;
      if (state.currentWorkspace && typeof window !== "undefined") localStorage.setItem("currentWorkspaceId", action.payload);
    },
    upsertWorkspace: (state, action) => {
      const workspace = action.payload;
      const index = state.workspaces.findIndex((item) => item.id === workspace.id);
      if (index === -1) state.workspaces.push(workspace);
      else state.workspaces[index] = workspace;
      if (state.currentWorkspace?.id === workspace.id || !state.currentWorkspace) {
        state.currentWorkspace = workspace;
        if (typeof window !== "undefined") localStorage.setItem("currentWorkspaceId", workspace.id);
      }
    },
  },
  extraReducers: (builder) => builder
    .addCase(loadWorkspaces.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(loadWorkspaces.fulfilled, (state, action) => {
      state.loading = false;
      state.workspaces = action.payload;
      const savedId = typeof window !== "undefined" ? localStorage.getItem("currentWorkspaceId") : null;
      state.currentWorkspace = action.payload.find((workspace) => workspace.id === savedId) || action.payload[0] || null;
    })
    .addCase(loadWorkspaces.rejected, (state, action) => { state.loading = false; state.error = action.error.message; }),
});

export const { setCurrentWorkspace, upsertWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
