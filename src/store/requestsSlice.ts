import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { SSApplication } from '../models'
import { updateApplication } from '../api/jsonServer'
import { API_BASE_URL } from '../api/config/configFile'


// ------------------ Async Thunks ------------------

// Fetch all applications (admin)
export const fetchAllApplications = createAsyncThunk<SSApplication[]>(
  'requests/fetchAll',
  async () => {
    const res = await fetch(`${API_BASE_URL}/applications`)
    const data = await res.json()
    return data as SSApplication[]
  }
)

// Fetch applications for a specific user
export const fetchUserApplications = createAsyncThunk<SSApplication[], string>(
  'requests/fetchUser',
  async (userEmail) => {
    const res = await fetch(`${API_BASE_URL}/applications?userEmail=${userEmail}`)
    const data = await res.json()
    return data as SSApplication[]
  }
)

// Approve/Reject (admin)
export const updateApplicationStatus = createAsyncThunk<
  SSApplication,
  { id: number; status: 'approved' | 'rejected' }
>('requests/updateStatus', async ({ id, status }) => {
  const updated = await updateApplication(id, { status })
  return updated
})

// ------------------ Slice ------------------
interface RequestsState {
  applications: SSApplication[]
  loading: boolean
  error: string | null
}

const initialState: RequestsState = {
  applications: [],
  loading: false,
  error: null,
}

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all / user
    builder
      .addCase(fetchAllApplications.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAllApplications.fulfilled, (state, action: PayloadAction<SSApplication[]>) => {
        state.loading = false
        state.applications = action.payload
      })
      .addCase(fetchAllApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch applications'
      })

    builder
      .addCase(fetchUserApplications.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchUserApplications.fulfilled, (state, action: PayloadAction<SSApplication[]>) => {
        state.loading = false
        state.applications = action.payload
      })
      .addCase(fetchUserApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch applications'
      })

    // Update status
    builder
      .addCase(updateApplicationStatus.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateApplicationStatus.fulfilled, (state, action: PayloadAction<SSApplication>) => {
        state.loading = false
        const idx = state.applications.findIndex(a => a.id === action.payload.id)
        if (idx !== -1) state.applications[idx] = action.payload
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update status'
      })
  }
})

export default requestsSlice.reducer
