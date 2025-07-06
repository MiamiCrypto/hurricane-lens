import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import { loadStormData } from '@/services/dataLoader'
import { useStormStore } from '@/hooks/useStormStore'
import YearSelector from '@/components/YearSelector'
import StormSelector from '@/components/StormSelector'
import TrackMap from '@/components/TrackMap'
import IntensityChart from '@/components/IntensityChart'
import CategoryBar from '@/components/CategoryBar'
import AceChart from '@/components/AceChart'
import WindRadiiChart from '@/components/WindRadiiChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { storms, year, selectedStormId } = useStormStore()

  useEffect(() => {
    loadStormData()
  }, [])
  
  // Filter storms for the current year
  const stormsByYear = storms.filter(storm => {
    if (!storm.DateTime) return false;
    const stormDate = new Date(storm.DateTime);
    return stormDate.getFullYear() === year;
  });

  // Get some key stats
  const stormIds = stormsByYear.map(s => `${s.StormName}-${s.CycloneNum}`);
  const uniqueStormIds = Array.from(new Set(stormIds));
  const totalStorms = uniqueStormIds.length;
  
  const strongestWind = Math.max(0, ...stormsByYear.map(s => s.MaxWind_kt || 0));
  
  const dateTimes = stormsByYear
    .filter(s => s.DateTime)
    .map(s => new Date(s.DateTime as string).getTime());
  const lastUpdate = dateTimes.length > 0 
    ? new Date(Math.max(...dateTimes))
    : null;

  return (
    <>
      <Head>
        <title>Hurricane Lens</title>
        <meta name="description" content="Track and visualize hurricane data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-100/40 text-slate-800 font-sans text-sm leading-snug flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 text-white p-4">
          <div className="mx-auto max-w-[1440px] px-6">
            <h1 className="text-xl font-bold">Hurricane Lens</h1>
            <p className="text-xs text-slate-300">Visualize Atlantic hurricane data from 2010-2024</p>
          </div>
        </header>

        {/* Content with Sidebar */}
        <div className="flex flex-1 mx-auto max-w-[1440px] px-6 w-full">
          {/* Sidebar */}
          <aside className="w-60 shrink-0 bg-white p-4 shadow-sm rounded-r-xl my-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2">Select Year</h2>
              <YearSelector />
            </div>
            
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2">Select Storm</h2>
              <StormSelector />
            </div>
            
            {/* Key Stats */}
            <div className="mt-6">
              <h2 className="text-base font-semibold mb-2">Key Stats</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Storms:</span>
                  <span className="font-medium">{totalStorms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Strongest Wind:</span>
                  <span className="font-medium">{strongestWind} kt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Update:</span>
                  <span className="font-medium">
                    {lastUpdate ? lastUpdate.toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main Content - Tableau-style Dashboard */}
          <main className="flex-1 p-6 grid gap-6" style={{
            gridTemplateColumns: '2.2fr 1fr',
            gridTemplateRows: '60vh 33vh'
          }}>
            {/* Top left: Map */}
            <Card className="p-4 rounded-xl shadow-sm bg-white overflow-hidden relative">
              <h2 className="text-base font-semibold mb-2">Hurricane Tracks</h2>
              <div className="h-[calc(100%-2rem)]">
                <TrackMap />
              </div>
            </Card>
            
            {/* Top right: Category Bar and ACE Chart */}
            <div className="flex flex-col gap-6 h-full">
              <Card className="p-4 rounded-xl shadow-sm bg-white overflow-hidden flex-1">
                <h2 className="text-base font-semibold mb-2">Storm Categories</h2>
                <div className="h-[calc(100%-2rem)]">
                  <CategoryBar storms={stormsByYear} />
                </div>
              </Card>
              
              <Card className="p-4 rounded-xl shadow-sm bg-white overflow-hidden flex-1">
                <h2 className="text-base font-semibold mb-2">Accumulated Cyclone Energy</h2>
                <div className="h-[calc(100%-2rem)]">
                  <AceChart storms={stormsByYear} />
                </div>
              </Card>
            </div>

            {/* Bottom row: Wind Intensity and Wind Radii Charts */}
            <Card className="p-4 rounded-xl shadow-sm bg-white overflow-hidden h-full">
              <h2 className="text-base font-semibold mb-2">Wind Intensity</h2>
              <div className="h-[calc(100%-2rem)]">
                <IntensityChart />
              </div>
            </Card>
            
            <Card className="p-4 rounded-xl shadow-sm bg-white overflow-hidden h-full">
              <h2 className="text-base font-semibold mb-2">Wind Radii Growth</h2>
              <div className="h-[calc(100%-2rem)]">
                <WindRadiiChart />
              </div>
            </Card>
          </main>
        </div>
        
        <footer className="bg-slate-200 text-xs text-center py-2 mt-auto">
          <div className="mx-auto max-w-[1440px] px-6">
            Data from NOAA National Hurricane Center
          </div>
        </footer>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1280px) {
          main {
            grid-template-columns: 1fr !important;
            grid-template-rows: repeat(4, auto) !important;
          }
        }
        
        @media (max-width: 640px) {
          div.flex {
            flex-direction: column;
          }
          
          aside {
            width: 100%;
            border-radius: 0;
            margin: 0;
          }
        }
      `}</style>
    </>
  )
} 