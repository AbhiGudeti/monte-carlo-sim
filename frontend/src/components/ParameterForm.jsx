import { useState } from 'react'

const ParameterForm = ({ parameters, setParameters, isLoading }) => {
  const handleInputChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleOptionTypeChange = (type) => {
    setParameters(prev => ({
      ...prev,
      option_type: type
    }))
  }

  const inputFields = [
    {
      key: 'S0',
      label: 'Initial Stock Price (S₀)',
      type: 'number',
      step: '0.01',
      min: '0.01'
    },
    {
      key: 'K',
      label: 'Strike Price (K)',
      type: 'number',
      step: '0.01',
      min: '0.01'
    },
    {
      key: 'T',
      label: 'Time to Maturity (T, years)',
      type: 'number',
      step: '0.01',
      min: '0.01'
    },
    {
      key: 'r',
      label: 'Risk-free Rate (r)',
      type: 'number',
      step: '0.001',
      min: '0'
    },
    {
      key: 'sigma',
      label: 'Volatility (σ)',
      type: 'number',
      step: '0.001',
      min: '0.001'
    },
    {
      key: 'num_simulations',
      label: 'Number of Simulations',
      type: 'number',
      step: '1',
      min: '100'
    },
    {
      key: 'num_steps',
      label: 'Number of Steps',
      type: 'number',
      step: '1',
      min: '10'
    }
  ]

  return (
    <div className="space-y-4">
      {inputFields.map(field => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {field.label}
          </label>
          <input
            type={field.type}
            value={parameters[field.key]}
            onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value) || 0)}
            step={field.step}
            min={field.min}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Option Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="European"
              checked={parameters.option_type === 'European'}
              onChange={(e) => handleOptionTypeChange(e.target.value)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="ml-2 text-sm text-slate-700">European Call</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="American"
              checked={parameters.option_type === 'American'}
              onChange={(e) => handleOptionTypeChange(e.target.value)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="ml-2 text-sm text-slate-700">American Call</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default ParameterForm 