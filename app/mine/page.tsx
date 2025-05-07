"use client"

import { useState, useEffect, useCallback } from 'react'
import ProfileHeader from '@/components/profile/ProfileHeader'
import WalletCard from '@/components/profile/WalletCard'
import ProfileStats from '@/components/profile/ProfileStats'
import ProfileActions from '@/components/profile/ProfileActions'
import apiService from '@/services/apiService'
import { useAuth } from '@/components/auth/AuthProvider'

export default function MinePage() {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userData, setUserData] = useState<{
        email: string
        name: string
        walletBalance: number
        crdScore: number
        uid: string
    } | null>(null)

    const { logout, getUserId } = useAuth()

    const USER_ID = getUserId() || ''
    console.log("userId -->", USER_ID)

    const fetchUserData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await apiService.user.getUserDetails(USER_ID)

            if (response.success && response.data) {
                setUserData(response.data)
            } else {
                setError(response.message || 'Failed to fetch user data')
                // toast.error(response.message || 'Failed to fetch user data')
            }
        } catch (error: unknown) {
            console.error('Error fetching user data:', error)

            // Handle 401 unauthorized error
            if (error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'status' in error.response) {
                const axiosError = error as { response: { status: number, data?: { message?: string } } }

                if (axiosError.response.status === 401) {
                    // toast.error('Session expired. Please login again.')
                    logout()
                } else {
                    const errorMessage = axiosError.response.data?.message || 'Error loading profile'
                    setError(errorMessage)
                    // toast.error(errorMessage)
                }
            } else {
                setError('Unknown error occurred')
                // toast.error('Unknown error occurred')
            }
        } finally {
            setIsLoading(false)
        }
    }, [logout, USER_ID])

    useEffect(() => {
        fetchUserData()
    }, [fetchUserData])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error || !userData) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
                    <div className="text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Failed to Load Profile</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Could not load user data. Please try again.'}</p>
                    <button
                        onClick={fetchUserData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-16">
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Profile Header */}
                <ProfileHeader
                    name={userData.name}
                    email={userData.email}
                    joinDate={new Date().toISOString()} // Example - replace with actual date
                />

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Wallet Card */}
                        <WalletCard balance={userData.walletBalance} userId={USER_ID} />

                        {/* Stats Card */}
                        <ProfileStats crdScore={userData.crdScore} />
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Actions Card */}
                        <ProfileActions />
                    </div>
                </div>
            </div>
        </div>
    )
} 