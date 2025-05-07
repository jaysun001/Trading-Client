"use client"

import { useState, useEffect } from 'react'
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import LoadingSpinner from './LoadingSpinner'
import apiService from '@/services/apiService'

interface UserBasicInfo {
    id: string
    name: string
    email: string
}

interface ResetPasswordFormProps {
    id: string
}

export default function ResetPasswordForm({ id }: ResetPasswordFormProps) {
    const userId = id

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const [user, setUser] = useState<UserBasicInfo | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (userId) {
            fetchUserDetails(userId)
        } else {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        checkPasswordStrength(newPassword)
    }, [newPassword])

    const fetchUserDetails = async (id: string) => {
        try {
            setLoading(true)
            setError(null)

            // Call the API to get user details
            const response = await apiService.admin.getUser(id)

            if (response.success && response.data) {
                const userData = response.data

                // Transform the data to match the UserBasicInfo interface
                setUser({
                    id: userData.id || userData._id,
                    name: userData.name,
                    email: userData.email
                })
            } else {
                setError(response.message || 'Failed to fetch user details')

                // If user not found, set notFound flag
                if (response.message?.includes('not found')) {
                    setNotFound(true)
                } else {
                    // Use mock data as fallback
                    setUser({
                        id: id,
                        name: 'User',
                        email: 'user@example.com'
                    })
                }
            }
        } catch (error: unknown) {
            console.error('Error fetching user details:', error)
            setError('Failed to fetch user details')

            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }

    const checkPasswordStrength = (password: string) => {
        if (!password) {
            setPasswordStrength('weak')
            return
        }

        // Check password strength
        const hasLowerCase = /[a-z]/.test(password)
        const hasUpperCase = /[A-Z]/.test(password)
        const hasNumber = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
        const isLongEnough = password.length >= 8

        const strength =
            [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough]
                .filter(Boolean).length

        if (strength < 3) {
            setPasswordStrength('weak')
        } else if (strength < 5) {
            setPasswordStrength('medium')
        } else {
            setPasswordStrength('strong')
        }
    }

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak':
                return 'bg-red-500'
            case 'medium':
                return 'bg-yellow-500'
            case 'strong':
                return 'bg-green-500'
            default:
                return 'bg-gray-300'
        }
    }

    const getPasswordFeedback = () => {
        if (!newPassword) return ''

        switch (passwordStrength) {
            case 'weak':
                return 'Password is too weak. Add more variety.'
            case 'medium':
                return 'Password could be stronger. Try adding special characters.'
            case 'strong':
                return 'Strong password!'
            default:
                return ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            return
        }

        if (newPassword !== confirmPassword) {
            return
        }

        if (passwordStrength === 'weak') {
            return
        }

        try {
            setSubmitting(true)
            setError(null)
            setSuccess(false)

            // Call the API to reset the password
            const response = await apiService.admin.resetPassword(
                user.id,
                newPassword
            )

            if (response.success) {
                setSuccess(true)

                // Reset form
                setNewPassword('')
                setConfirmPassword('')
            } else {
                setError(response.message || 'Failed to reset password')
            }
        } catch (error: unknown) {
            console.error('Error resetting password:', error)
            setError('Failed to reset password')
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
                    <h1 className="text-3xl font-bold">Reset Password</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl">
                    <div className="text-center py-6">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {userId ? 'User not found. Please check the ID and try again.' : 'Please select a user to reset password.'}
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
                <h1 className="text-3xl font-bold">Reset Password</h1>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 p-4 rounded-lg mb-6">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6">
                    <p>Password has been reset successfully. The user will need to use the new password for their next login.</p>
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
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={8}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {newPassword && (
                            <div className="mt-2">
                                <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2">
                                    <div
                                        className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                                        style={{ width: passwordStrength === 'weak' ? '30%' : passwordStrength === 'medium' ? '70%' : '100%' }}
                                    ></div>
                                </div>
                                <p className={`text-sm mt-1 ${passwordStrength === 'weak' ? 'text-red-500' :
                                    passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                                    }`}>
                                    {getPasswordFeedback()}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    <div className="pt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            This will reset the user&apos;s password. The user will need to log in with the new password on their next session.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || newPassword !== confirmPassword || passwordStrength === 'weak' || success}
                            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${(submitting || newPassword !== confirmPassword || passwordStrength === 'weak' || success) ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {submitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 