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

const LeafletMap = dynamic(
  () => import("./LeafletMap"),
  { ssr: false }
)

export default function TrackMap() {
  const { storms, year, selectedStormId } = useStormStore()
  const [filteredStorms, setFilteredStorms] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)
  
  // Filter storms by selected year
  useEffect(() => {
    const stormsByYear = storms.filter(storm => {
      const stormDate = new Date(storm.DateTime)
      return stormDate.getFullYear() === year
    })
    setFilteredStorms(stormsByYear)
  }, [storms, year])

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <Card className="h-[500px] w-full rounded-2xl shadow-md overflow-hidden">
      <CardContent className="p-0 h-full">
        {isMounted ? (
          <LeafletMap storms={filteredStorms} selectedStormId={selectedStormId} />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Loading map...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 