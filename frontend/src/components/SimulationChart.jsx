// frontend/src/components/SimulationChart.jsx
import { useState, forwardRef, useImperativeHandle } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { TrendingUp, BarChart3, FileDown } from 'lucide-react'

const SimulationChart = forwardRef(({ data }, ref) => {
  const [activeTab, setActiveTab] = useState('paths')

  // Expose export function to parent
  useImperativeHandle(ref, () => ({
    exportToPNG: async () => {
      try {
        console.log('Starting PNG export...')
        
        // Import html2canvas dynamically
        const html2canvas = await import('html2canvas')
        console.log('html2canvas loaded successfully')
        
        // Wait a moment for any animations/transitions to complete
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const chartElement = document.querySelector('.chart-container')
        
        if (!chartElement) {
          console.error('Chart container not found')
          alert('Chart container not found. Please ensure the chart is visible.')
          return
        }

        console.log('Found chart element:', chartElement)
        console.log('Element dimensions:', {
          width: chartElement.offsetWidth,
          height: chartElement.offsetHeight,
          scrollWidth: chartElement.scrollWidth,
          scrollHeight: chartElement.scrollHeight
        })
        
        // Create a temporary container with fixed CSS colors to avoid oklch issues
        const tempContainer = chartElement.cloneNode(true)
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.top = '0'
        tempContainer.style.backgroundColor = '#ffffff'
        tempContainer.style.width = chartElement.scrollWidth + 'px'
        tempContainer.style.height = chartElement.scrollHeight + 'px'
        tempContainer.style.paddingBottom = '20px' // Add padding to prevent cutoff
        tempContainer.style.overflow = 'visible'
        
        // Override any problematic CSS properties
        const overrideStyles = `
          * {
            color: rgb(0, 0, 0) !important;
            background-color: transparent !important;
          }
          .bg-slate-50 { background-color: rgb(248, 250, 252) !important; }
          .bg-slate-100 { background-color: rgb(241, 245, 249) !important; }
          .bg-white { background-color: rgb(255, 255, 255) !important; }
          .text-slate-900 { color: rgb(15, 23, 42) !important; }
          .text-slate-700 { color: rgb(51, 65, 85) !important; }
          .text-slate-600 { color: rgb(71, 85, 105) !important; }
          .border-slate-200 { border-color: rgb(226, 232, 240) !important; }
          .border-slate-300 { border-color: rgb(203, 213, 225) !important; }
          .chart-container > div:first-child { display: none !important; }
        `
        
        const styleElement = document.createElement('style')
        styleElement.textContent = overrideStyles
        tempContainer.appendChild(styleElement)
        
        document.body.appendChild(tempContainer)
        
        try {
          // Use html2canvas with options to handle CSS compatibility
          const canvas = await html2canvas.default(tempContainer, {
            backgroundColor: '#ffffff',
            scale: 1.5,
            useCORS: true,
            allowTaint: false,
            logging: false,
            removeContainer: false,
            width: tempContainer.scrollWidth,
            height: tempContainer.scrollHeight + 40, // Extra height for padding
            scrollX: 0,
            scrollY: 0,
            ignoreElements: (element) => {
              // Skip elements that might have problematic CSS
              return element.tagName === 'STYLE' && element.textContent.includes('oklch')
            },
            onclone: (clonedDoc) => {
              // Additional cleanup in the cloned document
              const clonedElement = clonedDoc.querySelector('.chart-container')
              if (clonedElement) {
                clonedElement.style.backgroundColor = '#ffffff'
                clonedElement.style.height = 'auto'
                clonedElement.style.minHeight = tempContainer.scrollHeight + 'px'
              }
            }
          })
          
          console.log('Canvas created successfully:', canvas)
          console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)
          
          // Create download link
          const dataUrl = canvas.toDataURL('image/png')
          console.log('Data URL created, length:', dataUrl.length)
          
          const link = document.createElement('a')
          link.download = `monte_carlo_chart_${activeTab}_${Date.now()}.png`
          link.href = dataUrl
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          console.log('PNG export completed successfully')
          
          // Show success message
          const successMsg = document.createElement('div')
          successMsg.textContent = 'Chart exported successfully!'
          successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#10B981;color:white;padding:12px 24px;border-radius:8px;z-index:9999;font-weight:500;'
          document.body.appendChild(successMsg)
          setTimeout(() => document.body.removeChild(successMsg), 3000)
          
        } finally {
          // Clean up temporary container
          document.body.removeChild(tempContainer)
        }
        
      } catch (error) {
        console.error('Failed to export PNG:', error)
        console.error('Error stack:', error.stack)
        alert(`Failed to export chart: ${error.message}. Check the browser console for more details.`)
      }
    }
  }))

  if (!data) return null

  const { paths, histogram, payoff_histogram, parameters } = data

  // Prepare line chart data (combine all paths)
  const lineChartData = []
  if (paths && paths.length > 0) {
    const maxLength = Math.max(...paths.map(path => path.data.length))
    
    for (let i = 0; i < maxLength; i++) {
      const point = { time: paths[0].data[i]?.time || 0 }
      paths.forEach((path, pathIndex) => {
        if (path.data[i]) {
          point[`path${pathIndex}`] = path.data[i].price
        }
      })
      lineChartData.push(point)
    }
  }

  // Color palette for paths
  const pathColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#22C55E', '#A855F7', '#0EA5E9',
    '#EAB308', '#DC2626', '#059669', '#7C3AED', '#DB2777'
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-slate-900">
            Time: {typeof label === 'number' ? label.toFixed(3) : label} years
          </p>
          {payload.slice(0, 5).map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              Path {index + 1}: ${entry.value?.toFixed(2)}
            </p>
          ))}
          {payload.length > 5 && (
            <p className="text-xs text-slate-500">... and {payload.length - 5} more</p>
          )}
        </div>
      )
    }
    return null
  }

  const HistogramTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-slate-900">
            {activeTab === 'histogram' ? 'Price' : 'Payoff'}: ${typeof label === 'number' ? label.toFixed(2) : label}
          </p>
          <p className="text-sm text-blue-600">
            Count: {payload[0]?.value}
          </p>
        </div>
      )
    }
    return null
  }

  const tabs = [
    { id: 'paths', label: 'Price Paths', icon: TrendingUp },
    { id: 'histogram', label: 'Final Prices', icon: BarChart3 },
    { id: 'payoffs', label: 'Payoff Distribution', icon: BarChart3 },
  ]

  return (
    <div className="chart-container">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-100 rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Chart Content */}
      <div className="h-96">
        {activeTab === 'paths' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(2)}y`}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {paths.map((_, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={`path${index}`}
                  stroke={pathColors[index % pathColors.length]}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'histogram' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogram} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="price" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip content={<HistogramTooltip />} />
              <Bar 
                dataKey="count" 
                fill="url(#priceGradient)"
                radius={[2, 2, 0, 0]}
              />
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'payoffs' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payoff_histogram} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="payoff" 
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip content={<HistogramTooltip />} />
              <Bar 
                dataKey="count" 
                fill="url(#payoffGradient)"
                radius={[2, 2, 0, 0]}
              />
              <defs>
                <linearGradient id="payoffGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-700">Strike Price:</span>
            <span className="ml-2 text-slate-900">${parameters.K}</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Initial Price:</span>
            <span className="ml-2 text-slate-900">${parameters.S0}</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Time to Expiry:</span>
            <span className="ml-2 text-slate-900">{parameters.T} years</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Volatility:</span>
            <span className="ml-2 text-slate-900">{(parameters.sigma * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Risk-free Rate:</span>
            <span className="ml-2 text-slate-900">{(parameters.r * 100).toFixed(2)}%</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Simulations:</span>
            <span className="ml-2 text-slate-900">{parameters.num_simulations.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

SimulationChart.displayName = 'SimulationChart'

export default SimulationChart 