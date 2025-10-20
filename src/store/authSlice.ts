// store/authSlice.ts
import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '../api/authApi';
import { loginUser, signupUser } from '../api/authApi';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const loadStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const storedUser = loadStoredUser();

const initialState: AuthState = {
  user: storedUser,
  loading: false,
  error: null,
  isAuthenticated: !!storedUser,
};

// -------- Async Thunks --------
export const login = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const user = await loginUser(email, password);
    return user;
  } catch (err: unknown) {
    let message = 'Login failed';
    if (err instanceof Error) message = err.message;
    return rejectWithValue(message);
  }
});

export const signup = createAsyncThunk<
  User,
  { name: string; email: string; password: string },
  { rejectValue: string }
>('auth/signup', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const user = await signupUser({ name, email, password });
    return user;
  } catch (err: unknown) {
    let message = 'Signup failed';
    if (err instanceof Error) message = err.message;
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Login failed';
      state.isAuthenticated = false;
    });

    // Signup
    builder.addCase(signup.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signup.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      // IMPORTANT: Do NOT set user or isAuthenticated
      // Signup only creates the account
    });
    builder.addCase(signup.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Signup failed';
    });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
