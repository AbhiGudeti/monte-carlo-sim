// frontend/src/components/ResultsPanel.jsx
import { DollarSign, TrendingUp, BarChart, Target, Percent, Calculator } from 'lucide-react'

const ResultsPanel = ({ results }) => {
  if (!results) return null

  const { statistics, option_price, option_type } = results

  const formatCurrency = (value) => `$${value.toFixed(4)}`
  const formatPercent = (value) => `${value.toFixed(2)}%`
  const formatNumber = (value) => value.toFixed(4)

  const stats = [
    {
      label: 'Option Price',
      value: formatCurrency(option_price),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      isHighlight: true
    },
    {
      label: 'Mean Final Price',
      value: formatCurrency(statistics.mean_final_price),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Standard Deviation',
      value: formatCurrency(statistics.std_final_price),
      icon: BarChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      label: 'Mean Payoff',
      value: formatCurrency(statistics.mean_payoff),
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      label: 'In-the-Money %',
      value: formatPercent(statistics.in_the_money_percentage),
      icon: Percent,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      label: 'Price Range',
      value: `${formatCurrency(statistics.min_final_price)} - ${formatCurrency(statistics.max_final_price)}`,
      icon: Calculator,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ]

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center space-x-2 mb-6">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-slate-900">
          {option_type} Call Results
        </h3>
      </div>

      {/* Horizontal grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border ${stat.borderColor} ${stat.bgColor} ${
                stat.isHighlight 
                  ? 'ring-2 ring-green-300 ring-opacity-50' 
                  : ''
              } transition-all hover:shadow-md`}
            >
              <div className="text-center">
                <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-3`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className={`font-bold ${
                    stat.isHighlight ? 'text-green-700 text-lg' : 'text-slate-900 text-sm'
                  }`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-600 leading-relaxed">
          The option price is calculated using Monte Carlo simulation with {results.parameters.num_simulations.toLocaleString()} 
          simulation paths and {results.parameters.num_steps} time steps. 
          The simulation assumes a geometric Brownian motion model for the underlying asset price.
        </p>
      </div>
    </div>
  )
}

export default ResultsPanel