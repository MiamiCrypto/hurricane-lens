"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { calculateAce } from '@/utils/ace'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface AceChartProps {
  storms: any[]
}

export default function AceChart({ storms }: AceChartProps) {
  const [mounted, setMounted] = useState(false)
  const [aceData, setAceData] = useState<{dates: Date[], values: number[]}>({
    dates: [],
    values: []
  })

  useEffect(() => {
    setMounted(true)
    
    if (storms.length > 0) {
      // Create array of {date, ace} objects
      const acePoints = storms
        .filter(storm => storm.DateTime && storm.MaxWind_kt)
        .map(storm => ({
          date: new Date(storm.DateTime),
          ace: calculateAce(storm.MaxWind_kt || 0)
        }))
        // Sort by date
        .sort((a, b) => a.date.getTime() - b.date.getTime())
      
      // Group by date and sum ACE
      const aceByDate: Record<string, number> = {}
      acePoints.forEach(point => {
        const dateStr = point.date.toISOString().split('T')[0]
        aceByDate[dateStr] = (aceByDate[dateStr] || 0) + point.ace
      })
      
      // Convert to arrays for plotting
      const dates: Date[] = []
      const cumulativeAce: number[] = []
      let runningTotal = 0
      
      Object.entries(aceByDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .forEach(([dateStr, ace]) => {
          dates.push(new Date(dateStr))
          runningTotal += ace
          cumulativeAce.push(runningTotal)
        })
      
      setAceData({
        dates,
        values: cumulativeAce
      })
    }
  }, [storms])

  if (!mounted) return <div className="h-full flex items-center justify-center">Loading chart...</div>

  // Create data for area chart
  const plotData = [{
    x: aceData.dates,
    y: aceData.values,
    type: 'scatter' as const,
    mode: 'lines' as const,
    fill: 'tozeroy' as const,
    line: { color: 'rgb(31, 119, 180)', width: 2 },
    fillcolor: 'rgba(31, 119, 180, 0.3)',
    name: 'ACE'
  }]
  
  const layout = {
    height: 240,
    margin: { t: 10, r: 10, l: 40, b: 40 },
    yaxis: {
      title: {
        text: 'ACE Index',
        font: { size: 10 }
      },
      fixedrange: true,
      tickfont: { size: 9 }
    },
    xaxis: {
      title: {
        text: 'Date',
        font: { size: 10 }
      },
      fixedrange: true,
      tickfont: { size: 9 }
    },
    legend: {
      orientation: 'h' as const,
      y: -0.2,
      x: 0.5,
      xanchor: 'center' as const,
      yanchor: 'top' as const,
      font: { size: 9 }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      size: 10
    }
  }
  
  const config = {
    displayModeBar: false,
    responsive: true
  }

  return (
    <div className="h-full">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
} 