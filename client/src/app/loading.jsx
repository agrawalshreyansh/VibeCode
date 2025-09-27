'use client'


export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                </div>

                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">
                    Loading...
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Please wait while we prepare your content
                </p>
                <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    )
}