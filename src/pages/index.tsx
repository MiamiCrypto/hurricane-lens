import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import { loadStormData } from '@/services/dataLoader'
import { useStormStore } from '@/hooks/useStormStore'
import YearSelector from '@/components/YearSelector'
import StormSelector from '@/components/StormSelector'
import TrackMap from '@/components/TrackMap'
import IntensityChart from '@/components/IntensityChart'
import { Card, CardContent } from '@/components/ui/card'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { storms, selectedStormId } = useStormStore()
  
  useEffect(() => {
    loadStormData()
  }, [])
  
  return (
    <>
      <Head>
        <title>Hurricane Lens</title>
        <meta name="description" content="Track and visualize hurricane data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-b from-slate-100/70 to-slate-200/40 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl md:text-4xl font-bold">Hurricane Lens</h1>
              <div className="text-sm text-gray-500">
                {storms.length > 0 ? `${storms.length} data points loaded` : 'Loading data...'}
              </div>
            </div>
            <p className="mt-2 text-lg text-gray-600">
              Visualize Atlantic hurricane data from 2010-2024
            </p>
          </header>
          
          {/* Controls Section */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div className="w-full md:flex-1">
                <YearSelector />
              </div>
              <div className="flex flex-col">
                <StormSelector />
                <div className="text-sm text-gray-500 mt-1">
                  {selectedStormId === null ? 
                    'Showing all storms' : 
                    'Showing selected storm'}
                </div>
              </div>
            </div>
          </section>
          
          {/* Visualization Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-3">Hurricane Tracks</h2>
              <TrackMap />
            </div>
            
            {/* Chart */}
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-3">Wind Intensity</h2>
              <IntensityChart />
            </div>
          </section>
          
          {/* Legend */}
          <section className="mt-8">
            <Card className="rounded-2xl shadow-md">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-2">Saffir-Simpson Hurricane Scale</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-500 rounded-full mr-2"></div>
                    <span className="text-sm">Tropical Depression (&lt;34 kt)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
                    <span className="text-sm">Tropical Storm (34-63 kt)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm">Category 1 (64-82 kt)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
                    <span className="text-sm">Category 2 (83-95 kt)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-700 rounded-full mr-2"></div>
                    <span className="text-sm">Category 3 (96-112 kt)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-600 rounded-full mr-2"></div>
                    <span className="text-sm">Category 4+ (≥113 kt)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Footer */}
          <footer className="mt-12 text-center text-sm text-gray-500">
            <p>Data from NOAA National Hurricane Center</p>
          </footer>
        </div>
      </main>
    </>
  )
} 