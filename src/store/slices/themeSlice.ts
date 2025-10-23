import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Theme } from '../../types'

interface ThemeState {
  mode: 'light' | 'dark'
  primary: string
  secondary: string
  accent: string
}

const initialState: ThemeState = {
  mode: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#f59e0b',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload
      localStorage.setItem('theme', action.payload)
      document.documentElement.classList.toggle('dark', action.payload === 'dark')
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.mode)
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
    },
    setPrimary: (state, action: PayloadAction<string>) => {
      state.primary = action.payload
    },
    setSecondary: (state, action: PayloadAction<string>) => {
      state.secondary = action.payload
    },
    setAccent: (state, action: PayloadAction<string>) => {
      state.accent = action.payload
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.mode = action.payload.mode
      state.primary = action.payload.primary
      state.secondary = action.payload.secondary
      state.accent = action.payload.accent
      localStorage.setItem('theme', action.payload.mode)
      document.documentElement.classList.toggle('dark', action.payload.mode === 'dark')
    },
  },
})

export const {
  setMode,
  toggleMode,
  setPrimary,
  setSecondary,
  setAccent,
  setTheme,
} = themeSlice.actions

export default themeSlice.reducer