"use client"

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import LoadingSpinner from './LoadingSpinner'
import apiService from '@/services/apiService'

interface UserTransaction {
    id: string
    type: 'deposit' | 'withdrawal' | 'trade' | 'adjustment'
    amount: number
    status: 'completed' | 'pending' | 'failed'
    timestamp: string
    description: string
}

interface UserDetailInfo {
    id: string
    name: string
    email: string
    createdAt: string
    lastLogin: string
    currentBalance: number
    totalDeposited: number
    totalWithdrawn: number
    tradingVolume: number
    invitationCode:string
    status: 'active' | 'inactive' | 'suspended'
    recentTransactions: UserTransaction[]
}

interface TransactionData {
    id?: string
    _id?: string
    type?: string
    amount?: number
    status?: string
    timestamp?: string
    createdAt?: string
    description?: string
    notes?: string
}

interface UserDetailsDisplayProps {
    id: string
}

export default function UserDetailsDisplay({ id }: UserDetailsDisplayProps) {
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [user, setUser] = useState<UserDetailInfo | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview')
    const [error, setError] = useState<string | null>(null)

    // Define the mock data functions first
    const getMockTransactions = (): UserTransaction[] => {
        return [
            {
                id: 'tx123',
                type: 'deposit',
                amount: 1000,
                status: 'completed',
                timestamp: '2023-06-15T10:30:00Z',
                description: 'Bank transfer deposit'
            },
            {
                id: 'tx124',
                type: 'trade',
                amount: -250.50,
                status: 'completed',
                timestamp: '2023-06-16T14:22:10Z',
                description: 'BTC-USDT trade'
            },
            {
                id: 'tx125',
                type: 'withdrawal',
                amount: -500,
                status: 'completed',
                timestamp: '2023-06-18T09:45:30Z',
                description: 'Withdrawal to bank account'
            },
            {
                id: 'tx126',
                type: 'trade',
                amount: 325.25,
                status: 'completed',
                timestamp: '2023-06-19T16:05:22Z',
                description: 'ETH-USDT trade'
            },
            {
                id: 'tx127',
                type: 'adjustment',
                amount: 50,
                status: 'completed',
                timestamp: '2023-06-20T11:30:00Z',
                description: 'Promotion bonus'
            }
        ]
    }

    const getMockUserDetails = (id: string): UserDetailInfo => {
        return {
            id: id,
            name: 'John Doe',
            email: 'john.doe@example.com',
            createdAt: '2023-01-15T14:23:45Z',
            lastLogin: '2023-06-20T09:12:35Z',
            currentBalance: 3250.75,
            totalDeposited: 5000,
            totalWithdrawn: 1200,
            tradingVolume: 15750.25,
            status: 'active',
            invitationCode:'jjj',
            recentTransactions: getMockTransactions()
        }
    }

    const fetchUserDetails = useCallback(async (id: string) => {
        setLoading(true)
        setError(null)
        try {
            const response = await apiService.admin.getUser(id)

            if (response.success && response.data) {
                const userData = response.data

                // Transform the data to match our UserDetailInfo interface
                const userDetail: UserDetailInfo = {
                    id: userData.id || userData._id,
                    name: userData.name,
                    email: userData.email,
                    createdAt: userData.createdAt || new Date().toISOString(),
                    lastLogin: userData.lastLogin || userData.lastActive || new Date().toISOString(),
                    currentBalance: userData.walletBalance || 0,
                    totalDeposited: userData.totalDeposited || 0,
                    totalWithdrawn: userData.totalWithdrawn || 0,
                    tradingVolume: userData.tradingVolume || 0,
                    invitationCode: userData.invitationCode,
                    status: userData.isActive !== undefined
                        ? (userData.isActive ? 'active' : 'inactive')
                        : (userData.status || 'active'),
                    recentTransactions: []
                }

                // If the API returns transactions, transform them
                if (userData.transactions && Array.isArray(userData.transactions)) {
                    userDetail.recentTransactions = userData.transactions.map((tx: TransactionData) => ({
                        id: tx.id || tx._id || '',
                        type: (tx.type || 'adjustment') as 'deposit' | 'withdrawal' | 'trade' | 'adjustment',
                        amount: tx.amount || 0,
                        status: (tx.status || 'completed') as 'completed' | 'pending' | 'failed',
                        timestamp: tx.timestamp || tx.createdAt || new Date().toISOString(),
                        description: tx.description || tx.notes || 'Transaction'
                    }))
                } else {
                    // Use mock transactions if the API doesn't return any
                    userDetail.recentTransactions = getMockTransactions()
                }

                setUser(userDetail)
            } else {
                setError(response.message || 'Failed to fetch user details')

                // Fallback to mock data if API fails
                if (response.message?.includes('not found')) {
                    setNotFound(true)
                } else {
                    setUser(getMockUserDetails(id))
                }
            }
        } catch (error: unknown) {
            console.error('Error fetching user details:', error)
            setError('Failed to fetch user details')

            // Fallback to mock data if API call fails
            setUser(getMockUserDetails(id))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (id) {
            fetchUserDetails(id)
        } else {
            setLoading(false)
        }
    }, [id, fetchUserDetails])

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const getTransactionStatusColor = (status: string): string => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getTransactionTypeColor = (type: string): string => {
        switch (type) {
            case 'deposit':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            case 'withdrawal':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
            case 'trade':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
            case 'adjustment':
                return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    const getTransactionAmountColor = (amount: number): string => {
        return amount >= 0
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
    }

    const getStatusBadgeColor = (status: string): string => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (notFound || !id) {
        return (
            <div>
                <div className="flex items-center mb-8">
                    <Link href="/admin/users" className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <h1 className="text-3xl font-bold">User Details</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl">
                    <div className="text-center py-6">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {id ? 'User not found. Please check the ID and try again.' : 'Please select a user to view details.'}
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

    if (!user) {
        return <LoadingSpinner />
    }

    return (
        <div>
            <div className="flex items-center mb-8">
                <Link href="/admin/users" className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </Link>
                <h1 className="text-3xl font-bold">User Details</h1>
            </div>

            {error && (
                <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg mb-6">
                    <p>{error} (showing fallback data)</p>
                </div>
            )}

            {/* User Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                            {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                        <span className={`px-3 py-1 flex items-center justify-center rounded-full text-sm font-medium ${getStatusBadgeColor(user.status)}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                        <Link
                            href={`/admin/update-balance/${user.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Update Balance
                        </Link>
                        <Link
                            href={`/admin/reset-password/${user.id}`}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Reset Password
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3 px-6 ${activeTab === 'overview'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                            }`}
                    >
                        Overview
                    </button>
                    
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* User Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">User Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">User ID</p>
                            <p className="font-medium">{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</p>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Member Since</p>
                            <p className="font-medium">{formatDate(user.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Login</p>
                            <p className="font-medium">{formatDate(user.lastLogin)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                            <p className="font-medium capitalize">{user.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">InvitationCode</p>
                            <p className="font-medium capitalize">{user.invitationCode}</p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
} 