"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { getStormCategory } from '@/utils/ace'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface CategoryBarProps {
  storms: any[]
}

export default function CategoryBar({ storms }: CategoryBarProps) {
  const [mounted, setMounted] = useState(false)
  const [categoryData, setCategoryData] = useState<number[]>([0, 0, 0, 0, 0, 0])

  useEffect(() => {
    setMounted(true)
    
    // Count storms by category
    if (storms.length > 0) {
      // Group storms by ID to get unique storms
      const uniqueStorms = storms.reduce((acc: Record<string, any>, storm) => {
        const key = `${storm.StormName}-${storm.CycloneNum}`
        if (!acc[key] || (storm.MaxWind_kt && acc[key].MaxWind_kt < storm.MaxWind_kt)) {
          acc[key] = storm
        }
        return acc
      }, {})
      
      // Count by max category
      const categoryCounts = [0, 0, 0, 0, 0, 0] // TS, Cat1-5
      
      Object.values(uniqueStorms).forEach((storm: any) => {
        const windSpeed = storm.MaxWind_kt || 0
        const category = getStormCategory(windSpeed)
        categoryCounts[category]++
      })
      
      setCategoryData(categoryCounts)
    }
  }, [storms])

  if (!mounted) return <div className="h-full flex items-center justify-center">Loading chart...</div>

  // More visually appealing colors
  const colors = ['#6b7280', '#eab308', '#f97316', '#dc2626', '#9333ea', '#000000']
  const labels = ['Tropical Storm', 'Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5']
  
  // Create data for horizontal bar chart
  const plotData = [{
    y: labels,
    x: categoryData,
    type: 'bar' as const,
    orientation: 'h' as const,
    marker: {
      color: colors,
      line: {
        width: 1,
        color: 'white'
      }
    },
    text: categoryData.map(String),
    textposition: 'auto' as const,
    hoverinfo: 'x+y' as const,
  }]
  
  const layout = {
    height: 240,
    margin: { t: 10, r: 10, l: 120, b: 40 },
    xaxis: {
      title: { 
        text: 'Number of Storms',
        standoff: 5,
        font: { size: 10 }
      },
      fixedrange: true,
      showgrid: true,
      gridcolor: 'rgba(0,0,0,0.1)',
      tickfont: { size: 9 }
    },
    yaxis: {
      fixedrange: true,
      automargin: true,
      tickfont: { size: 9 }
    },
    bargap: 0.3,
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