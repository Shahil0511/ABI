import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

interface AuthState {
  token: string | null;
  user: User | null;
}

interface CredentialsPayload {
  token: string;
  user: User;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      // Persist to localStorage with proper structure
      localStorage.setItem("auth", JSON.stringify({
        token: action.payload.token,
        user: action.payload.user
      }));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("auth");
    },
    loadFromStorage: (state) => {
      const saved = localStorage.getItem("auth");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Validate the stored data has the expected structure
          if (parsed.token && parsed.user) {
            state.token = parsed.token;
            state.user = parsed.user;
          }
        } catch (error) {
          console.error("Failed to parse auth data from localStorage:", error);
          localStorage.removeItem("auth");
        }
      }
    },
  },
});

export const { setCredentials, logout, loadFromStorage } = authSlice.actions;
export default authSlice.reducer;