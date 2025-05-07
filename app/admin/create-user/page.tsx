"use client"

import { useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import apiService from '@/services/apiService'

interface CreateUserFormData {
    name: string
    email: string
    initialBalance: number
}

interface CreateUserResponse {
    name: string
    email: string
    walletBalance: number
    id: string
    invitationCode: string
}

export default function CreateUserPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null)
    const [formData, setFormData] = useState<CreateUserFormData>({
        name: '',
        email: '',
        initialBalance: 0
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === 'initialBalance') {
            // Only allow positive numbers for balance
            const balanceValue = value === '' ? 0 : Math.max(0, Number(value))
            setFormData(prev => ({ ...prev, [name]: balanceValue }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            initialBalance: 0
        })
        setSuccess(false)
        setCreatedUser(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.email.trim()) {
            return
        }

        try {
            setLoading(true)
            setSuccess(false)
            setCreatedUser(null)

            // Prepare data for API call
            const userData = {
                name: formData.name,
                email: formData.email,
                balance: formData.initialBalance
            }

            // Call the API
            const response = await apiService.admin.createUser(userData)

            if (response.success) {
                setSuccess(true)
                setCreatedUser(response.data || null)
            }
        } catch (error: unknown) {
            console.error('Error creating user:', error)

            // Handle different types of errors
            const apiError = error as {
                response?: {
                    data?: {
                        message?: string
                    }
                },
                message?: string
            }

            if (apiError.response?.data?.message) {
                // Server returned an error message
            } else if (apiError.message) {
                // Error object has a message property
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex items-center mb-8">
                <Link href="/admin/users" className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </Link>
                <h1 className="text-3xl font-bold">Create New User</h1>
            </div>

            {success && createdUser ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl">
                    <div className="mb-6">
                        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-6">
                            <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
                                User Created Successfully
                            </h2>
                            <p className="text-green-700 dark:text-green-400">
                                The user has been created and can now log in with the provided credentials.
                            </p>
                        </div>

                        <h3 className="text-lg font-medium mb-4">User Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                                <p className="font-medium">{createdUser.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium">{createdUser.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                                <p className="font-medium">{createdUser.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Wallet Balance</p>
                                <p className="font-medium text-green-600 dark:text-green-400">
                                    ${createdUser.walletBalance.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Invitation Code</p>
                                <p className="font-medium">{createdUser.invitationCode}</p>
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <Link
                                href={`/admin/user-details?id=${createdUser.id}`}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View User Details
                            </Link>
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Create Another User
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name*
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address*
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="user@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Initial Wallet Balance
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                                    $
                                </span>
                                <input
                                    type="number"
                                    id="initialBalance"
                                    name="initialBalance"
                                    value={formData.initialBalance}
                                    onChange={handleChange}
                                    className="w-full pl-8 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? 'Creating...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
} 