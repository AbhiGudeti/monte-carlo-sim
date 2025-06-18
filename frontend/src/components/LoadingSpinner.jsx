const LoadingSpinner = ({ size = 'normal', className = '' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    normal: 'h-5 w-5',
    large: 'h-8 w-8'
  }

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8v-2z"
        />
      </svg>
    </div>
  )
}

export default LoadingSpinner 