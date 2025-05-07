"use client"

import { useState, useEffect, useCallback } from 'react'
import apiService from '@/services/apiService'
import { useAuth } from '../auth/AuthProvider'

interface ClosedOrder {
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

const HistoryOrders = () => {
    const { logout } = useAuth()
    const [orders, setOrders] = useState<ClosedOrder[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [error, setError] = useState<string | null>(null)
    const ordersPerPage = 10

    const fetchClosedOrders = useCallback(async (page = 1) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await apiService.trading.getClosedOrders(page, ordersPerPage)

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
            } else {
                setError(response.message || 'Failed to fetch order history')
            }
        } catch (error: unknown) {
            console.error('Error fetching closed orders:', error)

            // Handle 401 unauthorized error
            if (error instanceof Error && error.cause instanceof Response && error.cause.status === 401) {
                logout()
            } else {
                const errorMessage = error instanceof Error ? error.message : 'Error fetching your order history'
                setError(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }, [logout, ordersPerPage])

    useEffect(() => {
        fetchClosedOrders(currentPage)
    }, [fetchClosedOrders, currentPage])

    const handlePageChange = (newPage: number) => {
        if (pagination && newPage > 0 && newPage <= pagination.pages) {
            setCurrentPage(newPage)
        }
    }

    // Render profit with appropriate color
    const renderProfit = (profit: string) => {
        // Check if profit is a string with a + or - prefix
        if (typeof profit === 'string') {
            if (profit.startsWith('+')) {
                return <span className="text-green-500 font-medium">{profit}</span>
            } else if (profit.startsWith('-')) {
                return <span className="text-red-500 font-medium">{profit}</span>
            } else if (profit === 'false') {
                return <span className="text-yellow-500 font-medium">Pending</span>
            }
        }
        return <span className="text-gray-500">--</span>
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
                    onClick={() => fetchClosedOrders(currentPage)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (orders.length === 0 && !isLoading && !error) {
        return (
            <div className="text-center py-6 text-gray-500">
                You don&apos;t have any closed orders yet
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
                            <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit And Loss</th>
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
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-right">{renderProfit(order.profit)}</td>
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

export default HistoryOrders