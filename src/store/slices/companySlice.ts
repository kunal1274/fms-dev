import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Company } from '@/types'

interface CompanyState {
  current: Company | null
  list: Company[]
  loading: boolean
  error: string | null
}

const initialState: CompanyState = {
  current: null,
  list: [],
  loading: false,
  error: null,
}

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setCurrent: (state, action: PayloadAction<Company>) => {
      state.current = action.payload
    },
    setList: (state, action: PayloadAction<Company[]>) => {
      state.list = action.payload
    },
    addCompany: (state, action: PayloadAction<Company>) => {
      state.list.push(action.payload)
    },
    updateCompany: (state, action: PayloadAction<Company>) => {
      const index = state.list.findIndex(company => company.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = action.payload
      }
      if (state.current?.id === action.payload.id) {
        state.current = action.payload
      }
    },
    removeCompany: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(company => company.id !== action.payload)
      if (state.current?.id === action.payload) {
        state.current = null
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setError,
  setCurrent,
  setList,
  addCompany,
  updateCompany,
  removeCompany,
  clearError,
} = companySlice.actions

export default companySlice.reducer