"use client"

import { useState, useEffect } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import LoadingSpinner from './LoadingSpinner'
import apiService from '@/services/apiService'

interface UserBalance {
    id: string
    name: string
    email: string
    currentBalance: number
}

interface UpdateBalanceFormProps {
    id: string
}

export default function UpdateBalanceForm({ id }: UpdateBalanceFormProps) {
    const userId = id

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const [user, setUser] = useState<UserBalance | null>(null)
    const [amountToAdd, setAmountToAdd] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (userId) {
            fetchUserDetails(userId)
        } else {
            setLoading(false)
        }
    }, [userId])

    const fetchUserDetails = async (id: string) => {
        try {
            setLoading(true)
            setError(null)

            // Call the API to get user details
            const response = await apiService.admin.getUser(id)

            if (response.success && response.data) {
                const userData = response.data
                setUser({
                    id: userData.id || userData._id,
                    name: userData.name,
                    email: userData.email,
                    currentBalance: userData.walletBalance || 0
                })
            } else {
                setNotFound(true)
                setError(response.message || 'Failed to fetch user details')
            }
        } catch (error: unknown) {
            console.error('Error fetching user details:', error)
            setError('Failed to fetch user details')

            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user || !amountToAdd) {
            return
        }

        const amount = Number(amountToAdd)
        if (isNaN(amount) || amount <= 0) {
            return
        }

        try {
            setSubmitting(true)
            setError(null)

            // Call the API to update the balance (add only)
            const response = await apiService.admin.updateBalance(
                user.email || user.id, // Prefer email if available
                amount,
            )

            if (response.success) {
                // Get the updated balance from the response
                const updatedBalance = response.updatedBalance || response.updatedWalletBalance || (user.currentBalance + amount)

                // Update the local user state with the new balance
                setUser({
                    ...user,
                    currentBalance: updatedBalance
                })

                // Reset form
                setAmountToAdd('')
            } else {
                setError(response.message || 'Failed to update balance')
            }
        } catch (error: unknown) {
            console.error('Error updating balance:', error)
            setError('Failed to update balance')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (notFound || !userId) {
        return (
            <div>
                <div className="flex items-center mb-8">
                    <Link href="/admin/users" className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-3xl font-bold">Update User Balance</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl">
                    <div className="text-center py-6">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {userId ? 'User not found. Please check the ID and try again.' : 'Please select a user to update balance.'}
                        </p>
                        <Link
                            href="/admin/users"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Users List
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Ensure user is not null before rendering
    if (!user) {
        return <LoadingSpinner />
    }

    return (
        <div>
            <div className="flex items-center mb-8">
                <Link href="/admin/users" className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </Link>
                <h1 className="text-3xl font-bold">Update User Balance</h1>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">User Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                            <p className="text-lg font-medium">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="text-lg font-medium">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                            <p className="text-lg font-medium">{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                            <p className="text-lg font-medium text-green-600 dark:text-green-400">${user.currentBalance.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Note: As an admin, you can only add funds to a user&apos;s wallet.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount to Add
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                                $
                            </span>
                            <input
                                type="number"
                                id="balance"
                                value={amountToAdd}
                                onChange={(e) => setAmountToAdd(e.target.value)}
                                min="0.01"
                                step="0.01"
                                required
                                className="w-full pl-8 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            New balance will be: $
                            {(user.currentBalance + (Number(amountToAdd) || 0)).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {submitting ? 'Adding Funds...' : 'Add Funds'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 