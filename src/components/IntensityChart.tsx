"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useStormStore } from "@/hooks/useStormStore"
import { catColor } from "@/utils/catColor"
import { PlotData, Layout, Config } from "plotly.js"

// Dynamically import Plot with no SSR
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface StormTrack {
  id: string
  name: string
  dates: string[]
  winds: number[]
  pressures: number[]
  colors: string[]
  maxWind: number
  displayName: string
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
      if (!storm.DateTime) return false;
      const stormDate = new Date(storm.DateTime);
      return stormDate.getFullYear() === year;
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
      points.sort((a, b) => new Date(a.DateTime || "").getTime() - new Date(b.DateTime || "").getTime())
      
      // Find max wind speed
      const maxWind = Math.max(...points.map(p => p.MaxWind_kt || 0))
      
      // Extract date and wind data
      const track: StormTrack = {
        id,
        name: points[0].displayName || `${points[0].StormName || 'Unnamed'} (${points[0].CycloneNum})`,
        displayName: points[0].displayName || `${points[0].StormName || 'Unnamed'} (${points[0].CycloneNum})`,
        dates: points.map(p => p.DateTime || ""),
        winds: points.map(p => p.MaxWind_kt || 0),
        pressures: points.map(p => p.MinPressure_mb || null).filter(Boolean) as number[],
        colors: points.map(p => catColor(p.MaxWind_kt || 0)),
        maxWind
      }
      
      return track
    })

    setStormTracks(tracks)
  }, [storms, year])

  if (!isMounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading chart...</p>
      </div>
    )
  }

  if (!stormTracks.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No storm data available for {year}</p>
      </div>
    )
  }

  // If no storm is selected, show a placeholder
  if (selectedStormId === null) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <p className="text-gray-500 text-lg mb-2">Select a storm to view its wind & pressure history</p>
        <p className="text-gray-400 text-sm">Use the dropdown above to choose a specific storm</p>
      </div>
    )
  }

  // Find the selected storm
  const selectedStorm = stormTracks.find(track => track.id === selectedStormId);
  
  if (!selectedStorm) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Selected storm data not found</p>
      </div>
    )
  }

  // Create plot data for the selected storm only
  const plotData: Partial<PlotData>[] = [
    // Wind data
    {
      type: "scatter",
      mode: "lines+markers",
      x: selectedStorm.dates.map(date => new Date(date)),
      y: selectedStorm.winds,
      name: "Wind (kt)",
      line: { 
        color: selectedStorm.colors[Math.floor(selectedStorm.colors.length / 2)] || "#000",
        width: 2
      },
      marker: { 
        color: selectedStorm.colors,
        size: 6
      }
    } as Partial<PlotData>
  ];
  
  // Add pressure data if available
  if (selectedStorm.pressures.length > 0) {
    plotData.push({
      type: "scatter",
      mode: "lines",
      x: selectedStorm.dates.map(date => new Date(date)),
      y: selectedStorm.pressures,
      name: "Pressure (mb)",
      yaxis: "y2",
      line: { 
        color: "red",
        width: 2,
        dash: "dash"
      },
      marker: { 
        color: "red",
        size: 4
      }
    } as Partial<PlotData>);
  }

  const layout: Partial<Layout> = {
    title: {
      text: `${selectedStorm.displayName} – intensity vs. time`,
      font: { size: 11 }
    },
    autosize: true,
    height: 250,
    margin: { l: 40, r: 40, t: 30, b: 80 },
    xaxis: { 
      title: {
        text: "",
        font: { size: 10 }
      },
      tickformat: "%b %d",
      tickfont: { size: 9 }
    },
    yaxis: { 
      title: {
        text: "Wind Speed (kt)",
        font: { size: 10 }
      },
      zeroline: false,
      gridcolor: "#f0f0f0",
      tickfont: { size: 9 },
      range: [0, Math.max(120, selectedStorm.maxWind * 1.1)] // Set reasonable range based on max wind
    },
    yaxis2: {
      title: {
        text: "Pressure (mb)",
        font: { size: 10 }
      },
      overlaying: "y",
      side: "right",
      showgrid: false,
      zeroline: false,
      tickfont: { size: 9 },
      range: [
        Math.min(950, Math.min(...selectedStorm.pressures) - 10),
        Math.max(1020, Math.max(...selectedStorm.pressures) + 10)
      ]
    },
    hovermode: "closest",
    showlegend: true,
    legend: { 
      orientation: 'h',
      y: -0.2,
      x: 0.5,
      xanchor: "center",
      yanchor: "top",
      font: { size: 9 }
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      size: 10
    }
  };

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false
  };

  return (
    <div className="h-full">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  )
} 