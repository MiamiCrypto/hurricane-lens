"use client"

import React, { useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from "react-leaflet"
import { catColor } from "@/utils/catColor"
import "leaflet/dist/leaflet.css"

// Import CSS in useEffect only

interface LeafletMapProps {
  storms: any[]
  selectedStormId: string | null
}

export default function LeafletMap({ storms, selectedStormId }: LeafletMapProps) {
  useEffect(() => {
    // This ensures the CSS is only imported on the client side
    require("leaflet/dist/leaflet.css")
  }, [])

  // Group storm points by storm ID for polylines
  const stormGroups = React.useMemo(() => {
    const groups: Record<string, any[]> = {}
    
    storms.forEach(storm => {
      // Create a composite key using storm name and cyclone number
      const stormId = `${storm.StormName}-${storm.CycloneNum}`
      
      // If this is the first point for this storm, initialize an array
      if (!groups[stormId]) {
        groups[stormId] = []
      }
      
      // Add the point to the storm's array
      groups[stormId].push(storm)
    })
    
    // Sort each storm's points by date
    Object.keys(groups).forEach(id => {
      groups[id].sort((a, b) => 
        new Date(a.DateTime).getTime() - new Date(b.DateTime).getTime()
      )
    })
    
    return groups
  }, [storms])

  return (
    <MapContainer
      center={[25, -60]} // Atlantic hurricane basin
      zoom={4}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Draw polylines for storm tracks */}
      {Object.entries(stormGroups).map(([stormId, points]) => {
        // Skip if this isn't the selected storm (when a storm is selected)
        if (selectedStormId !== null && stormId !== selectedStormId) {
          return null
        }
        
        // Get coordinates for polyline
        const positions = points
          .filter(p => p.Latitude && p.Longitude)
          .map(p => [p.Latitude, p.Longitude])
          
        // Get color based on max wind in this storm
        const maxWind = Math.max(...points.map(p => p.MaxWind_kt || 0))
        const lineColor = catColor(maxWind)
        
        // Skip if no valid positions
        if (positions.length < 2) return null
        
        return (
          <Polyline
            key={`path-${stormId}`}
            positions={positions as [number, number][]}
            pathOptions={{
              color: lineColor,
              weight: selectedStormId === stormId ? 4 : 2,
              opacity: selectedStormId === stormId ? 1 : 0.5
            }}
          />
        )
      })}
      
      {/* Draw points for each storm observation */}
      {storms.map((storm, index) => {
        // Check if storm has valid coordinates
        if (!storm.Latitude || !storm.Longitude) return null
        
        // Skip if this isn't the selected storm (when a storm is selected)
        const stormId = `${storm.StormName}-${storm.CycloneNum}`
        if (selectedStormId !== null && stormId !== selectedStormId) {
          return null
        }
        
        const windSpeed = storm.MaxWind_kt || 0
        const stormColor = catColor(windSpeed)
        const stormRadius = Math.max(3, Math.min(10, windSpeed / 10)) // Scale radius between 3-10px
        
        return (
          <CircleMarker
            key={`${storm.StormName || "Unknown"}-${index}`}
            center={[storm.Latitude, storm.Longitude]}
            radius={selectedStormId === stormId ? stormRadius * 1.5 : stormRadius}
            pathOptions={{ 
              fillColor: stormColor, 
              color: "white",
              weight: selectedStormId === stormId ? 2 : 1,
              fillOpacity: selectedStormId === stormId ? 0.9 : 0.6,
              opacity: selectedStormId === stormId ? 1 : 0.25
            }}
          >
            <Tooltip>
              <strong>{storm.StormName || "Unnamed"} – #{storm.CycloneNum}</strong><br />
              {new Date(storm.DateTime).toLocaleDateString()}<br />
              <span className="font-medium">Wind: {windSpeed} kt</span>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
} 