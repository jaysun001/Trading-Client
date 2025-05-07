"use client"

import { useState, useEffect } from 'react'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import ProfileCard from '@/components/admin/ProfileCard'
import apiService from '@/services/apiService'

interface AdminDetails {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
}

interface ApiError {
    response?: {
        data?: {
            message?: string
        }
    }
    message?: string
}

export default function AdminProfilePage() {
    const [loading, setLoading] = useState(true)
    const [adminDetails, setAdminDetails] = useState<AdminDetails | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAdminDetails()
    }, [])

    const fetchAdminDetails = async () => {
        try {
            setLoading(true)
            setError(null)

            // Call the API to get admin details using apiService
            const response = await apiService.admin.getAdminDetails()

            if (response.success && response.data) {
                setAdminDetails(response.data)
            } else {
                setError(response.message || 'Failed to load admin details')
            }
        } catch (error: unknown) {
            console.error('Error fetching admin details:', error)
            setError('Failed to load admin details')

            // Handle different types of errors
            const apiError = error as ApiError
            if (apiError.response?.data?.message) {
                // No-op
            } else if (apiError.message) {
                // No-op
            } else {
                // No-op
            }
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[70vh]">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Admin Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    View and manage your administrator account information
                </p>
            </div>
            {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
                    <p>{error}</p>
                </div>
            )}
            {adminDetails && (
                <ProfileCard
                    adminDetails={adminDetails}
                    formatDate={formatDate}
                />
            )}
        </div>
    )
} 