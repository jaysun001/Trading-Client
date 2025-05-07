"use client"

import Link from 'next/link'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface User {
    id: string
    name: string
    email: string
    walletBalance: number
    createdAt: string
    status?: 'active' | 'inactive' | 'suspended'
    role?: 'user' | 'admin'
}

interface UserTableProps {
    users: User[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    onSort?: (column: string) => void
}

export default function UserTable({ users, sortBy, sortOrder, onSort }: UserTableProps) {
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date)
    }

    const getStatusBadgeColor = (status?: string): string => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        }
    }

    const getRoleBadgeColor = (role?: string): string => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
            case 'user':
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        }
    }

    const getSortIcon = (column: string) => {
        if (!onSort) return null
        if (sortBy !== column) return null

        return sortOrder === 'asc'
            ? <ChevronUpIcon className="h-4 w-4 inline ml-1" />
            : <ChevronDownIcon className="h-4 w-4 inline ml-1" />
    }

    const renderColumnHeader = (column: string, label: string) => {
        if (!onSort) {
            return <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</th>
        }

        return (
            <th
                className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => onSort(column)}
            >
                <span className="flex items-center">
                    {label}
                    {getSortIcon(column)}
                </span>
            </th>
        )
    }

    if (users.length === 0) {
        return null
    }

    const hasRoles = users.some(user => user.role !== undefined)
    const hasStatus = users.some(user => user.status !== undefined)

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-left">
                        <tr>
                            {renderColumnHeader('id', 'ID')}
                            {renderColumnHeader('name', 'Name')}
                            {renderColumnHeader('email', 'Email')}
                            {renderColumnHeader('walletBalance', 'Wallet Balance')}
                            {renderColumnHeader('createdAt', 'Join Date')}
                            {hasStatus && (
                                renderColumnHeader('status', 'Status')
                            )}
                            {hasRoles && (
                                renderColumnHeader('role', 'Role')
                            )}
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 text-sm font-mono">{user.id}</td>
                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                <td className="px-6 py-4 text-sm">{user.email}</td>
                                <td className="px-6 py-4 text-sm font-medium">
                                    ${user.walletBalance.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm">{formatDate(user.createdAt)}</td>
                                {hasStatus && (
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.status)}`}>
                                            {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                                        </span>
                                    </td>
                                )}
                                {hasRoles && (
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                                            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                                        </span>
                                    </td>
                                )}
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            href={`/admin/user-details/${user.id}`}
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/admin/update-balance/${user.id}`}
                                            className="text-green-600 dark:text-green-400 hover:underline"
                                        >
                                            Edit Balance
                                        </Link>
                                        <Link
                                            href={`/admin/reset-password/${user.id}`}
                                            className="text-amber-600 dark:text-amber-400 hover:underline"
                                        >
                                            Reset Password
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 