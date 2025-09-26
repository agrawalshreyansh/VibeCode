'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Error Icon */}
        <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          We encountered an unexpected error. Don't worry, it's not your fault.
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
              Error Details
            </summary>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono text-red-600 dark:text-red-400 overflow-auto">
              {error?.message || 'Unknown error occurred'}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="space-x-4">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}