import { create } from 'zustand'

export interface StormRow { 
  [k: string]: any;
  StormName?: string;
  CycloneNum?: number;
  MaxWind_kt?: number;
  MinPressure_mb?: number;
  DateTime?: string;
  displayName?: string;
  Category?: number;
}

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