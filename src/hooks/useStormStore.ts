import { create } from 'zustand'

export interface StormRow { [k: string]: any }

interface StormState {
  storms: StormRow[]
  year: number
  selectedStormId: string | null
  init: (rows: StormRow[]) => void
  setYear: (y: number) => void
  setStorm: (id: string | null) => void
}

export const useStormStore = create<StormState>((set) => ({
  storms: [],
  year: 2024,
  selectedStormId: null,
  
  init: (rows: StormRow[]) => {
    set({ storms: rows })
  },
  
  setYear: (y: number) => {
    set({ year: y, selectedStormId: null })
  },
  
  setStorm: (id: string | null) => {
    set({ selectedStormId: id })
  },
})) 