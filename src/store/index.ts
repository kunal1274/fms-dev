import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { api } from './api'
import authSlice from './slices/authSlice'
import companySlice from './slices/companySlice'
import themeSlice from './slices/themeSlice'
import notificationSlice from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSlice,
    company: companySlice,
    theme: themeSlice,
    notification: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [api.util.resetApiState.type],
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch