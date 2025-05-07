"use client"

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { SignupData } from '@/services/authServices'

export default function SignUp() {
    const router = useRouter()
    const { signup } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        invitationCode: ''
    })
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        invitationCode: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [apiError, setApiError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear errors when user types
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
            confirmPassword: '',
            invitationCode: ''
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
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
            valid = false
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
            valid = false
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
            valid = false
        }

        // Invitation code validation
        if (!formData.invitationCode) {
            newErrors.invitationCode = 'Invitation code is required'
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

            // Create user object
            const userData: SignupData = {
                email: formData.email,
                password: formData.password,
                invitationCode: formData.invitationCode
            }

            try {
                const result = await signup(userData)

                if (result.success) {
                    // Redirect to login after successful signup
                    router.push('/login')
                } else if (result.error) {
                    // Display the API error
                    setApiError(result.error)

                    // Update field-specific errors if provided
                    if (result.fieldErrors) {
                        setErrors(prev => ({
                            ...prev,
                            ...result.fieldErrors
                        }))
                    }
                }
            } catch (error: any) {
                // Fallback error handling
                console.error('Signup error:', error)
                setApiError(error?.message || 'An unexpected error occurred. Please try again.')
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Join the advanced trading platform
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
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-600'
                                        } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
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
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-600'
                                        } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                                        } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-300">
                                Invitation Code
                            </label>
                            <div className="mt-1">
                                <input
                                    id="invitationCode"
                                    name="invitationCode"
                                    type="text"
                                    required
                                    value={formData.invitationCode}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.invitationCode ? 'border-red-500' : 'border-gray-600'
                                        } rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.invitationCode && (
                                    <p className="mt-2 text-sm text-red-500">{errors.invitationCode}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-800 text-gray-400">Already have an account?</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                                Sign in to your account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
