"use client"

import { useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import apiService from '@/services/apiService'

interface WalletCardProps {
    balance: number
    userId: string
}

export default function WalletCard({ balance, userId }: WalletCardProps) {
    const [walletBalance, setWalletBalance] = useState(balance)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const refreshBalance = async () => {
        try {
            setIsRefreshing(true)
            const response = await apiService.user.getUserWalletBalance(userId)

            if (response.success) {
                setWalletBalance(response?.data?.walletBalance || balance)
                // toast.success('Balance updated successfully')
            } else {
                // toast.error(response.message || 'Failed to refresh balance')
            }
        } catch (error) {
            console.error('Error refreshing wallet balance:', error)
            // toast.error('Failed to refresh balance. Please try again.')
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Wallet Balance</h2>
                <button
                    onClick={refreshBalance}
                    disabled={isRefreshing}
                    className={`p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Refresh balance"
                >
                    <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="p-6">
                <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-gray-800 dark:text-white">${walletBalance.toLocaleString()}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">USD</span>
                </div>
            </div>
        </div>
    )
} 