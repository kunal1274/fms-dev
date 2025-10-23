import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { api, companiesApi, customersApi, vendorsApi, itemsApi, salesApi, purchasesApi, banksApi, taxesApi } from './api'
import authSlice from './slices/authSlice'
import companySlice from './slices/companySlice'
import themeSlice from './slices/themeSlice'
import notificationSlice from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [companiesApi.reducerPath]: companiesApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [vendorsApi.reducerPath]: vendorsApi.reducer,
    [itemsApi.reducerPath]: itemsApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    [purchasesApi.reducerPath]: purchasesApi.reducer,
    [banksApi.reducerPath]: banksApi.reducer,
    [taxesApi.reducerPath]: taxesApi.reducer,
    auth: authSlice,
    company: companySlice,
    theme: themeSlice,
    notification: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          api.util.resetApiState.type,
          companiesApi.util.resetApiState.type,
          customersApi.util.resetApiState.type,
          vendorsApi.util.resetApiState.type,
          itemsApi.util.resetApiState.type,
          salesApi.util.resetApiState.type,
          purchasesApi.util.resetApiState.type,
          banksApi.util.resetApiState.type,
          taxesApi.util.resetApiState.type,
        ],
      },
    }).concat(
      api.middleware,
      companiesApi.middleware, 
      customersApi.middleware, 
      vendorsApi.middleware,
      itemsApi.middleware,
      salesApi.middleware,
      purchasesApi.middleware,
      banksApi.middleware,
      taxesApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch