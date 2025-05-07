"use client"

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { LoginCredentials } from '@/services/authServices'

export default function Login() {
    const { login } = useAuth()
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    })
    const [apiError, setApiError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear field errors when the user makes changes
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
        // Clear API error when user makes any change
        if (apiError) {
            setApiError('')
        }
    }

    const validateForm = () => {
        let valid = true
        const newErrors = {
            email: '',
            password: '',
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required'
            valid = false
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
            valid = false
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required'
            valid = false
        }

        setErrors(newErrors)
        return valid
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setApiError('') // Clear any previous API errors

        if (validateForm()) {
            setIsSubmitting(true)

            try {
                const result = await login(formData)

                if (!result.success) {
                    // Display the error returned from the login function
                    setApiError(result.error || 'Login failed. Please check your credentials and try again.')
                }
                // No need for an else case - the AuthProvider will handle successful logins by redirecting
            } catch (err: any) {
                console.log("Unexpected error during login:", err)
                setApiError('An unexpected error occurred. Please try again later.')
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-gray-900 to-gray-800 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Access your trading dashboard
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
                    {apiError && (
                        <div className="mb-4 p-3 rounded-md bg-red-900 border border-red-700">
                            <p className="text-sm text-red-300">{apiError}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-600'} 
                                    rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-600'} 
                                    rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-500 hover:text-blue-400">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-400">New to platform?</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link href="/signup" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                                Create a new account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 