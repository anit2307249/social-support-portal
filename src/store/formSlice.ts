import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface FormState {
    applicationId: number | null
    step: number
}

const initialState: FormState = {
    applicationId: null,
    step: 1,
}

const slice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setApplicationId(state, action: PayloadAction<number | null>) {
      state.applicationId = action.payload
    },
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload
    },
  },
})

export const { setApplicationId, setStep } = slice.actions
export default slice.reducer