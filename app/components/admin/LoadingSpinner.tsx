"use client"

import React from 'react'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    fullPage?: boolean
    text?: string
}

export default function LoadingSpinner({
    size = 'md',
    fullPage = false,
    text = 'Loading...'
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }

    const spinnerContent = (
        <div className="flex flex-col items-center justify-center">
            <div className={`${sizeClasses[size]} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`}></div>
            {text && <p className="mt-3 text-gray-600 dark:text-gray-400">{text}</p>}
        </div>
    )

    if (fullPage) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 z-50">
                {spinnerContent}
            </div>
        )
    }

    return spinnerContent
} 