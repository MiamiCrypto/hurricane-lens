"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useStormStore } from "@/hooks/useStormStore"
import { catColor } from "@/utils/catColor"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Dynamically import Plot with no SSR
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface StormTrack {
  id: string
  name: string
  dates: string[]
  winds: number[]
  colors: string[]
  maxWind: number
}

export default function IntensityChart() {
  const { storms, year, selectedStormId } = useStormStore()
  const [stormTracks, setStormTracks] = useState<StormTrack[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Process storm data for plotting
  useEffect(() => {
    // Filter storms by selected year
    const stormsByYear = storms.filter(storm => {
      const stormDate = new Date(storm.DateTime)
      return stormDate.getFullYear() === year
    })

    // Group by storm name and cyclone number
    const stormGroups = stormsByYear.reduce((acc: Record<string, any[]>, storm) => {
      const stormId = `${storm.StormName}-${storm.CycloneNum}`
      if (!acc[stormId]) acc[stormId] = []
      acc[stormId].push(storm)
      return acc
    }, {})

    // Create track data for each storm
    const tracks = Object.entries(stormGroups).map(([id, points]) => {
      // Sort points by date
      points.sort((a, b) => new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime())
      
      // Find max wind speed
      const maxWind = Math.max(...points.map(p => p.MaxWind_kt || 0))
      
      // Extract date and wind data
      const track: StormTrack = {
        id,
        name: `${points[0].StormName || 'Unnamed'} – #${points[0].CycloneNum} (${maxWind} kt)`,
        dates: points.map(p => p.DateTime),
        winds: points.map(p => p.MaxWind_kt || 0),
        colors: points.map(p => catColor(p.MaxWind_kt || 0)),
        maxWind
      }
      
      return track
    })

    setStormTracks(tracks)
  }, [storms, year])

  if (!isMounted) {
    return (
      <Card className="h-[500px] w-full rounded-2xl shadow-md">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading chart...</p>
        </CardContent>
      </Card>
    )
  }

  if (!stormTracks.length) {
    return (
      <Card className="h-[500px] w-full rounded-2xl shadow-md">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-gray-500">No storm data available for {year}</p>
        </CardContent>
      </Card>
    )
  }

  // Filter tracks by selected storm if applicable
  const filteredTracks = selectedStormId
    ? stormTracks.filter(track => track.id === selectedStormId)
    : stormTracks

  // Create plot data
  const plotData = filteredTracks.map(track => ({
    type: "scatter",
    mode: "lines+markers",
    x: track.dates.map(date => new Date(date)),
    y: track.winds,
    name: track.name,
    line: { 
      color: track.colors[Math.floor(track.colors.length / 2)] || "#000",
      width: selectedStormId === track.id ? 2 : 1.5,
      opacity: selectedStormId === track.id ? 1 : 0.75
    },
    marker: { 
      color: track.colors,
      size: selectedStormId === track.id ? 5 : 4,
      opacity: selectedStormId === track.id ? 1 : 0.75
    }
  }))

  return (
    <Card className="h-[500px] w-full rounded-2xl shadow-md">
      <CardContent className="p-0 h-full">
        <Plot
          data={plotData}
          layout={{
            title: "Wind Intensity",
            autosize: true,
            margin: { l: 50, r: 20, t: 40, b: 50 },
            xaxis: { title: "Date" },
            yaxis: { 
              title: "Maximum Wind Speed (kt)",
              zeroline: false,
              gridcolor: "#f0f0f0",
            },
            hovermode: "closest",
            showlegend: true,
            legend: { 
              x: 0, 
              y: 1.1,
              orientation: "h",
              font: { size: 10 },
              traceorder: 'normal',
              itemsizing: 'constant'
            }
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
          config={{ responsive: true }}
        />
      </CardContent>
    </Card>
  )
} 