"use client"

import React, { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { useStormStore } from "@/hooks/useStormStore"

const MIN_YEAR = 2010
const MAX_YEAR = 2024
const YEARS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MIN_YEAR + i
)

export default function YearSelector() {
  const { year, setYear } = useStormStore()
  const [sliderValue, setSliderValue] = useState([year])

  // Update store when slider changes
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value)
    setYear(value[0])
  }

  // Sync component state with store
  useEffect(() => {
    setSliderValue([year])
  }, [year])

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Select Year</h2>
        <span className="text-xl font-bold">{sliderValue[0]}</span>
      </div>
      
      <Slider
        value={sliderValue}
        min={MIN_YEAR}
        max={MAX_YEAR}
        step={1}
        onValueChange={handleSliderChange}
        className="my-4 focus-visible:ring ring-offset-2"
        aria-label="Select year"
      />
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>{MIN_YEAR}</span>
        <span>{MAX_YEAR}</span>
      </div>
    </div>
  )
} 