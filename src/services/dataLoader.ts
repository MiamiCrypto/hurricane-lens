import Papa from 'papaparse'
import { useStormStore, StormRow } from '@/hooks/useStormStore'

const CSV_URL = 'https://raw.githubusercontent.com/MiamiCrypto/hurricane-lens/refs/heads/main/data/atl_2010_2024_clean.csv'

export async function loadStormData(): Promise<void> {
  try {
    // Fetch the CSV data
    const response = await fetch(CSV_URL)
    const csvText = await response.text()
    
    // Parse the CSV data with PapaParse
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        // Initialize the store with the parsed data
        useStormStore.getState().init(results.data as StormRow[])
        console.log(`Loaded ${results.data.length} storm data rows`)
      },
      error: (error: Error) => {
        console.error('Error parsing CSV data:', error)
      }
    })
  } catch (error: unknown) {
    console.error('Error fetching storm data:', error instanceof Error ? error.message : String(error))
  }
} 