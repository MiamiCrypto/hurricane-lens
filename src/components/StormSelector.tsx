"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useStormStore } from "@/hooks/useStormStore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StormOption {
  id: string
  label: string
}

export default function StormSelector() {
  const { storms, year, selectedStormId, setStorm } = useStormStore()
  const [stormOptions, setStormOptions] = useState<StormOption[]>([])

  // Generate storm options based on the selected year
  useEffect(() => {
    // Filter storms by the selected year
    const stormsByYear = storms.filter(storm => {
      const stormDate = new Date(storm.DateTime)
      return stormDate.getFullYear() === year
    })

    // Group by storm name and cyclone number to get unique storms
    const uniqueStorms = stormsByYear.reduce((acc: Record<string, any>, storm) => {
      const key = `${storm.StormName}-${storm.CycloneNum}`
      if (!acc[key]) {
        // Find max wind speed for this storm
        const maxWind = Math.max(
          ...(stormsByYear
            .filter(s => s.StormName === storm.StormName && s.CycloneNum === storm.CycloneNum)
            .map(s => s.MaxWind_kt || 0))
        )
        
        acc[key] = {
          id: key,
          stormName: storm.StormName,
          cycloneNum: storm.CycloneNum,
          maxWind: maxWind
        }
      }
      return acc
    }, {})

    // Convert to array and sort by cyclone number, then storm name
    const options: StormOption[] = Object.values(uniqueStorms)
      .map((storm: any) => ({
        id: storm.id,
        label: `${storm.stormName || 'Unnamed'} – #${storm.cycloneNum} (${storm.maxWind} kt)`
      }))
      .sort((a, b) => {
        // Extract cyclone numbers for sorting
        const numA = parseInt(a.id.split('-')[1]) || 0
        const numB = parseInt(b.id.split('-')[1]) || 0
        
        // Sort by cyclone number first
        if (numA !== numB) return numA - numB
        
        // Then sort by name
        return a.label.localeCompare(b.label)
      })

    // Add "All Storms" option at the beginning
    setStormOptions([
      { id: "all", label: "All Storms" },
      ...options
    ])

    // Reset selection when year changes
    setStorm(null)
  }, [storms, year, setStorm])

  // Handle selection change
  const handleSelectChange = (value: string) => {
    setStorm(value === "all" ? null : value)
  }

  return (
    <div className="w-64 relative z-20">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Storm
      </label>
      <Select
        value={selectedStormId || "all"}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="w-full focus-visible:ring ring-offset-2">
          <SelectValue placeholder="Select a storm" />
        </SelectTrigger>
        <SelectContent portal={false}>
          {stormOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 