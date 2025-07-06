"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useStormStore } from "@/hooks/useStormStore"
import { catColor } from "@/utils/catColor"
import { Card, CardContent } from "@/components/ui/card"
import type { CircleMarkerProps } from "react-leaflet"

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
)

const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
)

const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  { ssr: false }
)

// Import LeafletMap component
const LeafletMap = dynamic(
  () => import("./LeafletMap"),
  { ssr: false }
)

// Define the category legend
const catLegend = [
  ['gray', 'TS (<64 kt)'],
  ['yellow', 'Cat 1 (64-82 kt)'],
  ['orange', 'Cat 2 (83-95 kt)'],
  ['red', 'Cat 3 (96-112 kt)'],
  ['purple', 'Cat 4 (113-136 kt)'],
  ['black', 'Cat 5 (≥137 kt)']
];

interface StormPoint {
  lat: number
  lon: number
  windSpeed: number
  category: number
  date: Date
  pressure?: number
  name?: string
}

interface StormTrack {
  id: string
  name: string
  points: StormPoint[]
  color: string
}

export default function TrackMap() {
  const { storms, year, selectedStormId } = useStormStore()
  const [filteredStorms, setFilteredStorms] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)
  
  // Filter storms by selected year and storm ID (if selected)
  useEffect(() => {
    const stormsByYear = storms.filter(storm => {
      if (!storm.DateTime) return false;
      const stormDate = new Date(storm.DateTime);
      return stormDate.getFullYear() === year;
    })

    // If a storm is selected, filter to only that storm
    const data = stormsByYear.filter(
      s => selectedStormId ? `${s.StormName}-${s.CycloneNum}` === selectedStormId : true
    )
    
    setFilteredStorms(data)
  }, [storms, year, selectedStormId])
  
  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-full flex items-center justify-center">Loading map...</div>
  }

  return (
    <div className="h-full w-full relative">
      <LeafletMap 
        storms={filteredStorms} 
        selectedStormId={selectedStormId}
      />
      
      {/* Map Legend */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs flex gap-3 shadow-md">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#64B5F6] mr-1"></div>
          <span>TS (&lt;64 kt)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#FFB74D] mr-1"></div>
          <span>Cat 1 (64-82 kt)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#FB8C00] mr-1"></div>
          <span>Cat 2 (83-95 kt)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#EF5350] mr-1"></div>
          <span>Cat 3 (96-112 kt)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#9C27B0] mr-1"></div>
          <span>Cat 4+ (&gt;113 kt)</span>
        </div>
      </div>
    </div>
  )
}

// Helper function to determine hurricane category from wind speed
function getCategoryFromWind(windKt: number): number {
  if (windKt >= 137) return 5
  if (windKt >= 113) return 4
  if (windKt >= 96) return 3
  if (windKt >= 83) return 2
  if (windKt >= 64) return 1
  return 0 // Tropical Storm or Depression
} 