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
      if (!storm.DateTime) return false;
      const stormDate = new Date(storm.DateTime);
      return stormDate.getFullYear() === year;
    })

    // Group by storm name and cyclone number to get unique storms
    const uniqueStorms = stormsByYear.reduce((acc: Record<string, any>, storm) => {
      const key = `${storm.StormName}-${storm.CycloneNum}`
      if (!acc[key]) {
        acc[key] = {
          id: key,
          stormName: storm.StormName,
          cycloneNum: storm.CycloneNum,
          displayName: storm.displayName
        }
      }
      return acc
    }, {})

    // Convert to array and sort alphabetically by storm name, then by cyclone number
    const options: StormOption[] = Object.values(uniqueStorms)
      .map((storm: any) => ({
        id: storm.id,
        label: storm.displayName
      }))
      .sort((a, b) => {
        // Extract storm names for sorting
        const nameA = a.id.split('-')[0] || "";
        const nameB = b.id.split('-')[0] || "";
        
        // Sort by name first
        if (nameA !== nameB) return nameA.localeCompare(nameB);
        
        // Then sort by cyclone number
        const numA = parseInt(a.id.split('-')[1]) || 0;
        const numB = parseInt(b.id.split('-')[1]) || 0;
        return numA - numB;
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
    <div className="relative z-30">
      <Select
        value={selectedStormId || "all"}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="w-full focus-visible:ring ring-offset-2 text-white bg-slate-900 focus:ring-0">
          <SelectValue placeholder="All Storms" />
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