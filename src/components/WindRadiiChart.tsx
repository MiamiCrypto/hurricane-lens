"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useStormStore } from "@/hooks/useStormStore"
import { PlotData, Layout, Config } from "plotly.js"

// Dynamically import Plot with no SSR
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface RadiiData {
  dates: Date[]
  r34kt: number[]
  r50kt: number[]
  r64kt: number[]
  landfallDate?: Date
}

export default function WindRadiiChart() {
  const { storms, year, selectedStormId } = useStormStore()
  const [radiiData, setRadiiData] = useState<RadiiData>({
    dates: [],
    r34kt: [],
    r50kt: [],
    r64kt: []
  })
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Process storm data for plotting
  useEffect(() => {
    if (!selectedStormId) {
      setRadiiData({ dates: [], r34kt: [], r50kt: [], r64kt: [] })
      return
    }
    
    // Filter storms by selected year and storm ID
    const selectedStormData = storms.filter(storm => {
      if (!storm.DateTime) return false
      const stormDate = new Date(storm.DateTime)
      return stormDate.getFullYear() === year && 
        `${storm.StormName}-${storm.CycloneNum}` === selectedStormId
    })
    
    if (selectedStormData.length === 0) {
      setRadiiData({ dates: [], r34kt: [], r50kt: [], r64kt: [] })
      return
    }
    
    // Sort by date
    selectedStormData.sort((a, b) => 
      new Date(a.DateTime || "").getTime() - new Date(b.DateTime || "").getTime()
    )
    
    // Extract radii data
    // Note: This is simulated data since the actual data structure might be different
    // In a real application, you would use the actual radii fields from your data
    const dates: Date[] = []
    const r34kt: number[] = []
    const r50kt: number[] = []
    const r64kt: number[] = []
    
    selectedStormData.forEach((point, index) => {
      if (!point.DateTime) return
      
      const date = new Date(point.DateTime)
      dates.push(date)
      
      // Simulating radii data based on wind speed
      // In a real application, you would use actual radii fields
      const windSpeed = point.MaxWind_kt || 0
      
      // Simulate 34kt radius (larger for stronger storms)
      const base34 = Math.min(300, Math.max(20, windSpeed * 2))
      r34kt.push(base34 + Math.sin(index * 0.5) * 40)
      
      // Simulate 50kt radius (only present for stronger storms)
      if (windSpeed >= 50) {
        r50kt.push(Math.min(200, Math.max(10, windSpeed)))
      } else {
        r50kt.push(0)
      }
      
      // Simulate 64kt radius (only present for hurricane-force storms)
      if (windSpeed >= 64) {
        r64kt.push(Math.min(100, Math.max(5, windSpeed / 2)))
      } else {
        r64kt.push(0)
      }
    })
    
    // Simulate a landfall date at approximately 60% through the storm's lifecycle
    const landfallIndex = Math.floor(dates.length * 0.6)
    const landfallDate = dates.length > 0 ? dates[landfallIndex] : undefined
    
    setRadiiData({ dates, r34kt, r50kt, r64kt, landfallDate })
  }, [storms, year, selectedStormId])

  if (!isMounted) {
    return <div className="h-full flex items-center justify-center">Loading chart...</div>
  }

  if (!selectedStormId || radiiData.dates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center flex-col">
        <p className="text-gray-500 text-lg mb-2">Select a storm to view wind radii</p>
        <p className="text-gray-400 text-sm">Use the dropdown to choose a specific storm</p>
      </div>
    )
  }

  // Find the storm name for the title
  const stormName = storms.find(s => `${s.StormName}-${s.CycloneNum}` === selectedStormId)?.displayName || selectedStormId

  // Create plot data
  const plotData: Partial<PlotData>[] = [
    // 34kt wind radius
    {
      type: "scatter",
      mode: "lines",
      name: "34-kt radius",
      x: radiiData.dates,
      y: radiiData.r34kt,
      line: { color: "#3b82f6", width: 2 }
    },
    // 50kt wind radius
    {
      type: "scatter",
      mode: "lines",
      name: "50-kt radius",
      x: radiiData.dates,
      y: radiiData.r50kt,
      line: { color: "#f97316", width: 2, dash: "dash" }
    },
    // 64kt wind radius
    {
      type: "scatter",
      mode: "lines",
      name: "64-kt radius",
      x: radiiData.dates,
      y: radiiData.r64kt,
      line: { color: "#16a34a", width: 2, dash: "dot" }
    }
  ]
  
  // Add landfall marker and vertical line
  if (radiiData.landfallDate) {
    // Add landfall marker
    plotData.push({
      type: "scatter",
      mode: "markers",
      name: "landfall",
      x: [radiiData.landfallDate],
      y: [150], // Position in the middle of the chart
      marker: {
        symbol: "circle",
        size: 10,
        color: "black"
      },
      showlegend: true
    } as Partial<PlotData>)
    
    // Add vertical dashed line for landfall
    plotData.push({
      type: "scatter",
      mode: "lines",
      name: "landfall line",
      x: [radiiData.landfallDate, radiiData.landfallDate],
      y: [0, 400], // Span the entire height
      line: {
        color: "black",
        width: 1,
        dash: "dash"
      },
      showlegend: false
    } as Partial<PlotData>)
    
    // Create layout with landfall annotation
    const layout: Partial<Layout> = {
      title: {
        text: `${stormName} - wind-radii growth`,
        font: { size: 11 }
      },
      autosize: true,
      margin: { l: 40, r: 10, t: 30, b: 80 },
      xaxis: { 
        title: {
          text: "",
          font: { size: 10 }
        },
        tickformat: "%Y-%m-%d",
        tickfont: { size: 9 }
      },
      yaxis: { 
        title: {
          text: "Average radius (nm)",
          font: { size: 10 }
        },
        zeroline: false,
        gridcolor: "#f0f0f0",
        tickfont: { size: 9 },
        range: [0, 350] // Set fixed range to prevent infinite scrolling
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
      height: 250,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        size: 10
      },
      annotations: [
        {
          // Use the date directly as x value - Plotly will handle the conversion
          x: radiiData.landfallDate,
          y: 250, // Position higher to avoid overlap with data points
          xref: 'x',
          yref: 'y',
          text: 'landfall',
          showarrow: true,
          arrowhead: 2,
          ax: 0,
          ay: -40,
          font: { size: 9 },
          bgcolor: "rgba(255,255,255,0.7)",
          bordercolor: "#666",
          borderwidth: 1,
          borderpad: 2
        } as any // Use type assertion to avoid TypeScript error
      ]
    }
    
    const config: Partial<Config> = {
      responsive: true,
      displayModeBar: false
    }

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
  
  // Default layout without landfall annotation
  const layout: Partial<Layout> = {
    title: {
      text: `${stormName} - wind-radii growth`,
      font: { size: 11 }
    },
    autosize: true,
    margin: { l: 40, r: 10, t: 30, b: 80 },
    xaxis: { 
      title: {
        text: "",
        font: { size: 10 }
      },
      tickformat: "%Y-%m-%d",
      tickfont: { size: 9 }
    },
    yaxis: { 
      title: {
        text: "Average radius (nm)",
        font: { size: 10 }
      },
      zeroline: false,
      gridcolor: "#f0f0f0",
      tickfont: { size: 9 },
      range: [0, 350] // Set fixed range to prevent infinite scrolling
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
    height: 250,
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      size: 10
    }
  }

  const config: Partial<Config> = {
    responsive: true,
    displayModeBar: false
  }

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