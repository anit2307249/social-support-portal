import { configureStore } from "@reduxjs/toolkit"
import formReducer from "./formSlice"
import authReducer from './authSlice';
import requestsReducer from "./requestsSlice"

const store = configureStore({
  reducer: {
    form: formReducer,
    auth: authReducer,
    requests: requestsReducer,

  },  
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store