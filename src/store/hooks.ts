import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'  // ✅ type-only import
import type { RootState, AppDispatch } from './index'

// Use throughout your app instead of plain `useDispatch` / `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
