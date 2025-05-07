"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    UserPlusIcon,
    MagnifyingGlassIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    FunnelIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import UserTable from '@/components/admin/UserTable'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import apiService from '@/services/apiService'

// Define the User interface
interface User {
    id: string
    name: string
    email: string
    walletBalance: number
    createdAt: string
    status: 'active' | 'inactive' | 'suspended'
    role?: 'user' | 'admin'
}

interface Pagination {
    total: number
    page: number
    limit: number
    pages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

// interface ApiError {
//     response?: {
//         data?: {
//             message?: string
//         }
//     }
//     message?: string
// }

// interface ApiParams {
//     page?: number
//     limit?: number
//     sortBy?: string
//     sortOrder?: 'asc' | 'desc'
//     role?: 'user' | 'admin' | undefined
//     isActive?: boolean | string
//     search?: string
// }

export default function UsersPage() {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState<string | null>(null)

    // Pagination state
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
        hasNextPage: false,
        hasPrevPage: false
    })

    // Sorting and filtering state
    const [sortBy, setSortBy] = useState<string>('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [filterRole, setFilterRole] = useState<'user' | 'admin' | ''>('')
    const [filterActive, setFilterActive] = useState<boolean | ''>('')
    const [showFilters, setShowFilters] = useState(false)

    // Query params state
    const [queryParams, setQueryParams] = useState({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as 'asc' | 'desc',
        role: '' as 'user' | 'admin' | '',
        isActive: '' as boolean | '',
        search: ''
    })

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Prepare params for API call, removing empty values
            const apiParams: {
                page?: number
                limit?: number
                sortBy?: string
                sortOrder?: 'asc' | 'desc'
                role?: 'user' | 'admin'
                isActive?: boolean
                search?: string
            } = {}

            if (queryParams.page) apiParams.page = queryParams.page
            if (queryParams.limit) apiParams.limit = queryParams.limit
            if (queryParams.sortBy) apiParams.sortBy = queryParams.sortBy
            if (queryParams.sortOrder) apiParams.sortOrder = queryParams.sortOrder
            if (queryParams.role) apiParams.role = queryParams.role as 'user' | 'admin'
            if (queryParams.isActive !== '') apiParams.isActive = Boolean(queryParams.isActive)
            if (queryParams.search) apiParams.search = queryParams.search

            // Call the API
            const response = await apiService.admin.getUsers(apiParams)

            if (response.success && response.data) {
                // Transform the data to match our User interface
                const transformedUsers: User[] = response.data.map((user: {
                    id?: string
                    _id?: string
                    name: string
                    email: string
                    walletBalance: number
                    createdAt: string
                    isActive?: boolean
                    status?: string
                    role?: 'user' | 'admin'
                }) => ({
                    id: user.id || user._id || '',
                    name: user.name,
                    email: user.email,
                    walletBalance: user.walletBalance,
                    createdAt: user.createdAt,
                    status: user.isActive !== undefined
                        ? (user.isActive ? 'active' : 'inactive')
                        : ((user.status || 'active') as 'active' | 'inactive' | 'suspended'),
                    role: user.role
                }))

                setUsers(transformedUsers)

                // Handle pagination if it exists in the response
                if (response.pagination) {
                    setPagination(response.pagination)
                }
            } else {
                setError(response.message || 'Failed to load users')

                // Fallback to mock data if API fails
                const mockData = getMockUsers()
                setUsers(mockData)
                setPagination({
                    total: mockData.length,
                    page: 1,
                    limit: 10,
                    pages: Math.ceil(mockData.length / 10),
                    hasNextPage: mockData.length > 10,
                    hasPrevPage: false
                })
            }
        } catch (error: unknown) {
            console.error('Error fetching users:', error)
            setError('Error fetching users. Using sample data instead.')


            // Fallback to mock data if API call fails
            const mockData = getMockUsers()
            setUsers(mockData)
            setPagination({
                total: mockData.length,
                page: 1,
                limit: 10,
                pages: Math.ceil(mockData.length / 10),
                hasNextPage: mockData.length > 10,
                hasPrevPage: false
            })
        } finally {
            setLoading(false)
        }
    }, [queryParams])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    // Update query params when filters change
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setQueryParams(prev => ({
                ...prev,
                page: 1, // Reset to first page when filters change
                search: searchTerm,
                role: filterRole,
                isActive: filterActive
            }))
        }, 500) // Debounce search by 500ms

        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm, filterRole, filterActive])

    const getMockUsers = (): User[] => {
        return [
            {
                id: 'usr_123456',
                name: 'John Doe',
                email: 'john.doe@example.com',
                walletBalance: 3250.75,
                createdAt: '2023-01-15T14:23:45Z',
                status: 'active',
                role: 'user'
            },
            {
                id: 'usr_234567',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                walletBalance: 1500.50,
                createdAt: '2023-02-10T09:18:22Z',
                status: 'active',
                role: 'user'
            },
            {
                id: 'usr_345678',
                name: 'Robert Johnson',
                email: 'robert.johnson@example.com',
                walletBalance: 0,
                createdAt: '2023-03-05T16:45:30Z',
                status: 'inactive',
                role: 'user'
            },
            {
                id: 'usr_456789',
                name: 'Emily Brown',
                email: 'emily.brown@example.com',
                walletBalance: 750.25,
                createdAt: '2023-03-20T11:32:18Z',
                status: 'active',
                role: 'user'
            },
            {
                id: 'usr_567890',
                name: 'Michael Wilson',
                email: 'michael.wilson@example.com',
                walletBalance: 125.80,
                createdAt: '2023-04-08T13:15:40Z',
                status: 'suspended',
                role: 'admin'
            }
        ]
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleSortChange = (column: string) => {
        setSortBy(column)
        setSortOrder(prevOrder => {
            // If clicking on the same column, toggle the order
            if (sortBy === column) {
                const newOrder = prevOrder === 'asc' ? 'desc' : 'asc'
                // Update the query params 
                setQueryParams(prev => ({ ...prev, sortBy: column, sortOrder: newOrder }))
                return newOrder
            } else {
                // If clicking on a new column, default to descending order
                setQueryParams(prev => ({ ...prev, sortBy: column, sortOrder: 'desc' }))
                return 'desc'
            }
        })
    }

    const handleFilterChange = (filter: string, value: string | boolean): void => {
        switch (filter) {
            case 'role':
                setFilterRole(value as 'user' | 'admin' | '')
                break
            case 'active':
                setFilterActive(value as boolean | '')
                break
            default:
                break
        }
    }

    const resetFilters = () => {
        setFilterRole('')
        setFilterActive('')
        setSearchTerm('')
        setSortBy('createdAt')
        setSortOrder('desc')
        setQueryParams({
            page: 1,
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            role: '',
            isActive: '',
            search: ''
        })
    }

    const handlePageChange = (newPage: number) => {
        setQueryParams(prev => ({ ...prev, page: newPage }))
    }

    const handleLimitChange = (newLimit: number) => {
        setQueryParams(prev => ({ ...prev, page: 1, limit: newLimit }))
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h1 className="text-3xl font-bold">Users</h1>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <FunnelIcon className="h-5 w-5 mr-2" />
                        <span>Filters</span>
                        {(filterRole || filterActive !== '') && (
                            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {(filterRole ? 1 : 0) + (filterActive !== '' ? 1 : 0)}
                            </span>
                        )}
                    </button>
                    <Link
                        href="/admin/create-user"
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        <span>Create User</span>
                    </Link>
                </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Filters</h3>
                        <button
                            onClick={resetFilters}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Reset all
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role
                            </label>
                            <select
                                value={filterRole}
                                onChange={(e) => handleFilterChange('role', e.target.value as 'user' | 'admin' | '')}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All roles</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={filterActive === '' ? '' : String(filterActive)}
                                onChange={(e) => {
                                    const val = e.target.value
                                    handleFilterChange('active', val === '' ? '' : val === 'true')
                                }}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All statuses</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sort By
                            </label>
                            <div className="flex items-center space-x-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="createdAt">Join Date</option>
                                    <option value="name">Name</option>
                                    <option value="email">Email</option>
                                    <option value="walletBalance">Balance</option>
                                </select>
                                <button
                                    onClick={() => {
                                        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
                                        setSortOrder(newOrder)
                                        setQueryParams(prev => ({ ...prev, sortOrder: newOrder }))
                                    }}
                                    className="flex items-center justify-center p-2 bg-gray-200 dark:bg-gray-700 rounded-md"
                                >
                                    {sortOrder === 'asc' ? (
                                        <ChevronUpIcon className="h-5 w-5" />
                                    ) : (
                                        <ChevronDownIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg mb-6">
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <UserTable
                        users={users}
                        onSort={handleSortChange}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                    />

                    {users.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                            {searchTerm || filterRole || filterActive !== '' ? (
                                <p className="text-gray-600 dark:text-gray-400">
                                    No users found matching your filters. Try different search terms or filters.
                                </p>
                            ) : (
                                <p className="text-gray-600 dark:text-gray-400">
                                    No users found. Create a new user to get started.
                                </p>
                            )}
                        </div>
                    ) : (
                        // Pagination controls
                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="text-sm text-gray-700 dark:text-gray-400 mb-4 sm:mb-0">
                                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <select
                                    value={queryParams.limit}
                                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                                    className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md px-2 py-1 text-sm"
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="25">25 per page</option>
                                    <option value="50">50 per page</option>
                                </select>
                                <div className="grid grid-cols-5 sm:flex gap-1 w-full sm:w-auto">
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={!pagination.hasPrevPage}
                                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md ${pagination.hasPrevPage
                                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            }`}
                                        aria-label="First page"
                                    >
                                        <span className="hidden sm:inline">First</span>
                                        <span className="sm:hidden">«</span>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={!pagination.hasPrevPage}
                                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md ${pagination.hasPrevPage
                                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            }`}
                                        aria-label="Previous page"
                                    >
                                        <span className="hidden sm:inline">Prev</span>
                                        <span className="sm:hidden">‹</span>
                                    </button>
                                    <span className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-md">
                                        {pagination.page}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md ${pagination.hasNextPage
                                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            }`}
                                        aria-label="Next page"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <span className="sm:hidden">›</span>
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.pages)}
                                        disabled={!pagination.hasNextPage}
                                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md ${pagination.hasNextPage
                                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            }`}
                                        aria-label="Last page"
                                    >
                                        <span className="hidden sm:inline">Last</span>
                                        <span className="sm:hidden">»</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
} 