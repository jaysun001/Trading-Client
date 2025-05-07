
"use client"

import { useState, useEffect, useCallback } from 'react'
import apiService from '@/services/apiService'
import { useAuth } from '@/components/auth/AuthProvider'

interface OpenOrderType {
    _id: string
    cryptoCurrency: string
    termCode: string
    openingPrice: number
    deliveryPrice: number
    direction: string
    orderTime: number
    buyAmount: number
    openingTime: string
    deliveryTime: string
    profit: string
    createdAt: string
    updatedAt: string
    __v?: number
    user?: string
}

interface PaginationInfo {
    total: number
    page: number
    limit: number
    pages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

const OpenOrder = () => {
    const { logout } = useAuth()
    const [orders, setOrders] = useState<OpenOrderType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [timerKey, setTimerKey] = useState(0) // Add state to force timer updates
    const ordersPerPage = 10
    const [estimatedProfits, setEstimatedProfits] = useState<Record<string, number>>({})

    const fetchOpenOrders = useCallback(async (page = 1) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await apiService.trading.getOpenOrders(page, ordersPerPage)
            if (response.success) {
                setOrders(response.data || [])
                // Use the pagination info from the response
                if (response.pagination) {
                    setPagination(response.pagination)
                } else {
                    // Fallback to calculating pagination from count if the new format isn't available
                    const totalPages = Math.ceil((response.count || 0) / ordersPerPage)
                    setPagination({
                        total: response.count || 0,
                        page,
                        limit: ordersPerPage,
                        pages: totalPages,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1
                    })
                }

                // Initialize estimated profits for each order
                const initialProfits: Record<string, number> = {}
                response.data?.forEach(order => {
                    initialProfits[order._id] = generateRandomProfit(order.buyAmount)
                })
                setEstimatedProfits(initialProfits)
            } else {
                setError(response.message || 'Failed to fetch open orders')
            }
        } catch (error: unknown) {
            console.error('Error fetching open orders:', error)

            // Handle 401 unauthorized error
            if (error instanceof Error && error.message === 'Unauthorized') {
                logout()
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Error fetching your open orders'
                setError(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }, [logout, ordersPerPage])

    useEffect(() => {
        fetchOpenOrders(currentPage)
    }, [fetchOpenOrders, currentPage])

    // Generate a random profit based on the buy amount
    const generateRandomProfit = (buyAmount: number): number => {
        // Generate a random profit percentage between -10% and +15%
        const profitPercentage = Math.random() * 25 - 10
        const profit = buyAmount * (profitPercentage / 100)
        return parseFloat(profit.toFixed(2))
    }

    // Set up timer to update countdown and fluctuate profits every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTimerKey(prev => prev + 1)

            // Update estimated profits with new random values
            setEstimatedProfits(prevProfits => {
                const newProfits = { ...prevProfits }

                orders.forEach(order => {
                    // Only fluctuate if order is still active
                    const now = new Date()
                    const deliveryTime = new Date(order.deliveryTime)
                    const timeToDelivery = deliveryTime.getTime() - now.getTime()

                    // Don't fluctuate if less than 10 seconds to delivery
                    if (timeToDelivery > 10000) {
                        newProfits[order._id] = generateRandomProfit(order.buyAmount)
                    }
                })

                return newProfits
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [orders])

    const handlePageChange = (newPage: number) => {
        if (pagination && newPage > 0 && newPage <= pagination.pages) {
            setCurrentPage(newPage)
        }
    }

    // Format delivery time for better UI display
    const formatDeliveryTime = (dateString: string) => {
        const deliveryTime = new Date(dateString)
        const now = new Date()

        // If delivery time is in the future, calculate countdown
        if (deliveryTime > now) {
            const diffMs = deliveryTime.getTime() - now.getTime()
            const diffSec = Math.floor(diffMs / 1000)

            if (diffSec < 60) {
                return `${diffSec}s`
            } else if (diffSec < 3600) {
                return `${Math.floor(diffSec / 60)}m ${diffSec % 60}s`
            } else {
                return `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}m`
            }
        }

        // If already passed, just return date string
        return new Date(dateString).toLocaleString()
    }

    // Get time remaining until delivery in milliseconds
    const getTimeToDelivery = (deliveryTime: string): number => {
        const now = new Date()
        const delivery = new Date(deliveryTime)
        return Math.max(0, delivery.getTime() - now.getTime())
    }

    // Display profit based on order status and time to delivery
    const displayProfit = (order: OpenOrderType) => {
        const timeToDelivery = getTimeToDelivery(order.deliveryTime)
        const now = new Date()
        const delivery = new Date(order.deliveryTime)

        // If delivery time has passed, show actual profit
        if (delivery <= now) {
            return parseFloat(order.profit) || 0
        }

        // If within 10 seconds of delivery, show actual profit
        if (timeToDelivery <= 10000) {
            return parseFloat(order.profit) || 0
        }

        // Otherwise show estimated profit that fluctuates
        return estimatedProfits[order._id] || 0
    }

    // Determine profit display class based on value
    const getProfitClass = (profit: number) => {
        if (profit > 0) return "text-green-500"
        if (profit < 0) return "text-red-500"
        return "text-gray-500 dark:text-gray-400"
    }

    // Render order status based on delivery time
    const getOrderStatus = (deliveryTime: string, profit: string) => {
        const now = new Date()
        const delivery = new Date(deliveryTime)

        // If delivery time is in the future, it's active
        if (delivery > now) {
            return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs dark:bg-green-900 dark:text-green-300">Active</span>
        }

        // If profit is set, it's completed
        if (profit && profit !== 'false') {
            return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs dark:bg-blue-900 dark:text-blue-300">Completed</span>
        }

        // Otherwise it's processing
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs dark:bg-yellow-900 dark:text-yellow-300">Processing</span>
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error && orders.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{error}</p>
                <button
                    onClick={() => fetchOpenOrders(currentPage)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No open orders found</h3>
                <p className="text-gray-500 mt-2">You don&apos;t have any active trades at the moment.</p>
            </div>
        )
    }

    return (
        <div>
            {/* Responsive Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Term Code</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Opening Price</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery Price</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Direction</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Buy Amount</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Est. Profit</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Delivery In</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.cryptoCurrency}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{order.termCode}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{order.openingPrice.toLocaleString()}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{order.deliveryPrice.toLocaleString()}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right">
                                    <span className={order.direction === 'up' ? 'text-green-500' : 'text-red-500'}>
                                        {order.direction === 'up' ? 'Up' : 'Down'}
                                    </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{order.orderTime}S</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">{order.buyAmount}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right font-medium" key={`profit-${order._id}-${timerKey}`}>
                                    <span className={getProfitClass(displayProfit(order))}>
                                        {displayProfit(order) > 0 ? '+' : ''}{displayProfit(order).toFixed(2)}
                                    </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right">{getOrderStatus(order.deliveryTime, order.profit)}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-blue-500 font-medium" key={`${order._id}-${timerKey}`}>{formatDeliveryTime(order.deliveryTime)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination - updated to use the pagination info from the API */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center mt-6 space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className={`px-3 py-1 rounded-md ${!pagination.hasPrevPage
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Previous
                    </button>

                    <div className="flex space-x-1">
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handlePageChange(i + 1)}
                                className={`w-8 h-8 rounded-md ${pagination.page === i + 1
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className={`px-3 py-1 rounded-md ${!pagination.hasNextPage
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default OpenOrder