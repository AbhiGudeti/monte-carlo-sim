// frontend/src/App.jsx
import { useState, useRef } from 'react'
import { Play, Download, FileDown, TrendingUp, BarChart3, Activity } from 'lucide-react'
import SimulationChart from './components/SimulationChart'
import ParameterForm from './components/ParameterForm'
import ResultsPanel from './components/ResultsPanel'
import LoadingSpinner from './components/LoadingSpinner'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5001/api'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const chartRef = useRef(null)

  const [parameters, setParameters] = useState({
    S0: 100,
    K: 100,
    T: 1,
    r: 0.05,
    sigma: 0.2,
    num_simulations: 10000,
    num_steps: 252,
    option_type: 'European'
  })

  const runSimulation = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/simulate`, parameters)
      setResults(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run simulation')
    } finally {
      setIsLoading(false)
    }
  }

  const exportToPNG = () => {
    if (chartRef.current) {
      chartRef.current.exportToPNG()
    }
  }

  const exportToCSV = async () => {
    if (!results?.simulation_id) return
    
    try {
      const response = await axios.get(`${API_BASE_URL}/export/csv/${results.simulation_id}`, {
        responseType: 'blob' // Important for file download
      })
      
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `monte_carlo_results_${results.simulation_id}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSV export error:', err)
      setError('Failed to export CSV')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Monte Carlo Options Pricer</h1>
                <p className="text-sm text-slate-600">Real-time option pricing simulation</p>
              </div>
            </div>
            
            {results && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportToPNG}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Export PNG</span>
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Top Row: Parameters and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Parameter Input Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center space-x-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Parameters</h2>
                </div>
                
                <ParameterForm 
                  parameters={parameters}
                  setParameters={setParameters}
                  onSubmit={runSimulation}
                  isLoading={isLoading}
                />
                
                <button
                  onClick={runSimulation}
                  disabled={isLoading}
                  className="w-full mt-6 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Run Simulation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Chart Panel */}
            <div className="lg:col-span-3">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center space-x-2 mb-6">
                  <Activity className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Simulation Results</h2>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
                
                {isLoading && (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <LoadingSpinner size="large" />
                      <p className="mt-4 text-slate-600">Running Monte Carlo simulation...</p>
                    </div>
                  </div>
                )}
                
                {results && !isLoading && (
                  <SimulationChart 
                    ref={chartRef}
                    data={results} 
                  />
                )}
                
                {!results && !isLoading && !error && (
                  <div className="flex items-center justify-center h-96 text-slate-500">
                    <div className="text-center">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>Configure parameters and run simulation to see results</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Results Panel (Full Width) */}
          {results && (
            <ResultsPanel results={results} />
          )}
        </div>
      </main>
    </div>
  )
}

export default App