"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import authServices, { LoginCredentials, SignupData, ErrorResponse, UserRole } from '@/services/authServices'
import toast from 'react-hot-toast'

// LoadingOverlay component to display during authentication checks
function LoadingOverlay() {
    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-white text-lg">Loading...</p>
            </div>
        </div>
    )
}

// Create a component for safely using useSearchParams inside a Suspense boundary
function SearchParamsProvider({ children }: { children: (searchParams: URLSearchParams) => React.ReactNode }) {
    const searchParams = useSearchParams()
    return <>{children(searchParams)}</>
}

type AuthContextType = {
    isAuthenticated: boolean
    userRole: UserRole | null
    login: (credentials: LoginCredentials) => Promise<{
        success: boolean
        error?: string
    }>
    signup: (userData: SignupData) => Promise<{
        success: boolean
        error?: string
        fieldErrors?: Record<string, string>
    }>
    logout: () => void
    hasRole: (role: UserRole) => boolean
    getUserId: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Define route access control
const publicRoutes = ['/login', '/signup', '/about']
const adminRoutes = ['/admin']
const userRoutes = ['/', '/crypto', '/futureshistory', '/mine']

// Time before token expiry to trigger refresh (in seconds)
const REFRESH_THRESHOLD = 5 * 60 // 5 minutes

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [userRole, setUserRole] = useState<UserRole | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [showContent, setShowContent] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    // Setup proactive token refresh
    const setupTokenRefresh = useCallback(() => {
        // Clear any existing refresh timers
        if (typeof window !== 'undefined' && window.sessionStorage.getItem('refreshTimerId')) {
            const timerId = Number(window.sessionStorage.getItem('refreshTimerId'))
            clearTimeout(timerId)
        }

        const accessToken = localStorage.getItem('auth_token')
        if (!accessToken) return

        // Calculate time until token needs refresh
        const expiryTime = authServices.getTokenExpiryTime(accessToken)
        if (!expiryTime) return

        // Calculate when to refresh (threshold before expiry)
        const refreshTime = Math.max(0, (expiryTime - REFRESH_THRESHOLD) * 1000)

        // Set up token refresh timer if token is valid but will expire
        if (refreshTime > 0) {
            const timerId = window.setTimeout(async () => {
                try {
                    setIsRefreshing(true)
                    const refreshed = await authServices.refreshToken()
                    if (refreshed) {
                        // If refresh successful, set up next refresh
                        setupTokenRefresh()
                    }
                    setIsRefreshing(false)
                } catch (error) {
                    console.error('Failed to refresh token:', error)
                    // On failure, clear auth state
                    authServices.logout()
                    setIsAuthenticated(false)
                    setUserRole(null)
                    setIsRefreshing(false)
                    router.push('/login')
                }
            }, refreshTime)

            // Store timer ID in session storage to clear on page reload
            window.sessionStorage.setItem('refreshTimerId', timerId.toString())
        }
    }, [router])

    // Define checkAuth function at component scope so it can be referenced in multiple effects
    const checkAuth = useCallback(async () => {
        setIsLoading(true)
        setShowContent(false) // Hide content during auth check

        // Check if token exists but is expired (potential refresh needed)
        const accessToken = localStorage.getItem('auth_token')
        const refreshToken = localStorage.getItem('refresh_token')

        if (!accessToken && refreshToken) {
            // We have a refresh token but no valid access token
            // Attempt to refresh before determining auth state
            try {
                console.log("Token is expired, attempting refresh")
                setIsRefreshing(true)
                const refreshed = await authServices.refreshToken()

                if (refreshed) {
                    console.log("Token refreshed successfully")
                    const role = authServices.getUserRole()
                    setIsAuthenticated(true)
                    setUserRole(role)
                    setupTokenRefresh()
                    setShowContent(true) // Show content after successful refresh
                } else {
                    setIsAuthenticated(false)
                    setUserRole(null)
                    // Don't show content, will redirect
                }
            } catch (error) {
                console.error("Token refresh failed during auth check:", error)
                setIsAuthenticated(false)
                setUserRole(null)
            } finally {
                setIsRefreshing(false)
                setIsLoading(false)
            }
            return
        }

        // Normal auth check if we have a token or no refresh token
        const isAuth = authServices.isAuthenticated()
        console.log("Auth check - isAuthenticated:", isAuth)
        setIsAuthenticated(isAuth)

        // Get user role if authenticated
        if (isAuth) {
            const role = authServices.getUserRole()
            console.log("User role from token:", role)
            setUserRole(role)
            // Setup token refresh on initial auth check
            setupTokenRefresh()
            setShowContent(true) // Show content if authenticated
        } else {
            setUserRole(null)
            // Don't show content, will redirect
        }

        setIsLoading(false)
    }, [setupTokenRefresh])

    // Check authentication state
    useEffect(() => {
        checkAuth()

        // Event listener for storage changes (for multi-tab support)
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'auth_token' || event.key === 'refresh_token') {
                console.log("Storage changed, rechecking auth")
                checkAuth()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
            // Clear refresh timer on unmount
            if (typeof window !== 'undefined' && window.sessionStorage.getItem('refreshTimerId')) {
                const timerId = Number(window.sessionStorage.getItem('refreshTimerId'))
                clearTimeout(timerId)
            }
        }
    }, [checkAuth, isRefreshing])

    // Route protection logic
    useEffect(() => {
        // Only run this effect once auth state is determined and not during token refresh
        if (isLoading || isRefreshing) {
            console.log("Auth state still loading or refreshing, skipping route protection")
            return
        }

        const currentPath = pathname || '/'

        console.log("Route protection check:", {
            isAuthenticated,
            userRole,
            currentPath
        })

        // Logic for authenticated users
        if (isAuthenticated) {
            // Redirect from login/signup if already authenticated
            if (currentPath === '/login' || currentPath === '/signup') {
                console.log("Already authenticated, redirecting away from login/signup")
                const destination = userRole === 'admin' ? '/admin' : '/'
                router.push(destination)
                return
            }

            // Role-based access control for authenticated users
            if (userRole === 'admin') {
                // Admin can access admin routes but not user-specific routes
                if (userRoutes.some(route =>
                    currentPath.startsWith(route)) && !currentPath.startsWith('/admin')) {
                    console.log("Admin accessing user route, redirecting to admin dashboard")
                    router.push('/admin')
                    return
                }
            } else if (userRole === 'user') {
                // Regular users cannot access admin routes
                if (adminRoutes.some(route => currentPath.startsWith(route))) {
                    console.log("User accessing admin route, redirecting to home")
                    router.push('/')
                    return
                }
            }

            // If we've passed all the checks, show content
            setShowContent(true)
        }
        // Logic for unauthenticated users
        else {
            // Check if the current path is a public route - using same logic as middleware
            console.log("currentPath ->", currentPath)

            // Special handling for home route - only allow if public or user-specific route
            if (currentPath === '/') {
                console.log("Unauthenticated user accessing home route, redirecting to login")

                // Check for in-progress token refresh before redirecting
                if (localStorage.getItem('refresh_token')) {
                    console.log("Refresh token exists, attempting refresh instead of redirecting")
                    checkAuth()
                    return
                }

                const loginUrl = `/login`
                router.push(loginUrl)
                return
            }

            const isPublicRoute = publicRoutes.some(route =>
                route === '/' ? currentPath === '/' : currentPath.startsWith(route)
            )

            console.log("isPublicRoute ->", isPublicRoute)

            if (!isPublicRoute) {
                console.log("Unauthenticated user accessing protected route, redirecting to login")

                // Check for in-progress token refresh before redirecting for all protected routes
                if (localStorage.getItem('refresh_token')) {
                    console.log("Refresh token exists, attempting refresh instead of redirecting")
                    checkAuth()
                    return
                }

                const loginUrl = `/login`
                router.push(loginUrl)
                return
            }

            // Allow showing content for public routes
            if (isPublicRoute) {
                setShowContent(true)
            }
        }
    }, [isAuthenticated, isLoading, pathname, router, userRole, checkAuth, isRefreshing])

    const login = async (credentials: LoginCredentials): Promise<{
        success: boolean
        error?: string
    }> => {
        try {
            console.log("Login attempt started")
            const response = await authServices.login(credentials)
            console.log("Login API response received:", { success: response.success })

            // Update auth state immediately after successful login
            setIsAuthenticated(true)
            const role = authServices.getUserRole()
            console.log("User role after login:", role)
            setUserRole(role)

            // Setup token refresh on login
            setupTokenRefresh()

            return { success: true }
        } catch (error) {
            console.error("Login error:", error)

            // Handle structured error response
            if ((error as ErrorResponse).message) {
                const errorResponse = error as ErrorResponse
                const message = errorResponse.message || 'Invalid credentials. Please try again.'

                return {
                    success: false,
                    error: message
                }
            }

            // Handle generic errors
            const errorMessage = (error as Error).message || 'Invalid credentials. Please try again.'

            return {
                success: false,
                error: errorMessage
            }
        }
    }

    const signup = async (userData: SignupData): Promise<{
        success: boolean
        error?: string
        fieldErrors?: Record<string, string>
    }> => {
        try {
            await authServices.signup(userData)
            // toast.success('Account created successfully! Please log in.')
            return { success: true }
        } catch (error) {
            console.error("Signup error:", error)

            // Handle detailed validation errors
            if ((error as ErrorResponse).errors) {
                const errorResponse = error as ErrorResponse
                const fieldErrors: Record<string, string> = {}

                // Process field-specific errors
                if (errorResponse.errors) {
                    Object.entries(errorResponse.errors).forEach(([field, messages]) => {
                        fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages
                    })
                }

                // Show a toast with the main error message
                const mainMessage = errorResponse.message || 'Signup failed. Please check your information and try again.'
                // toast.error(mainMessage)

                return {
                    success: false,
                    error: mainMessage,
                    fieldErrors
                }
            }

            // Handle generic errors
            const errorMessage = (error as Error).message || 'An unexpected error occurred. Please try again.'
            // toast.error(errorMessage)

            return {
                success: false,
                error: errorMessage
            }
        }
    }

    const logout = () => {
        // Clear any refresh timers
        if (typeof window !== 'undefined' && window.sessionStorage.getItem('refreshTimerId')) {
            const timerId = Number(window.sessionStorage.getItem('refreshTimerId'))
            clearTimeout(timerId)
            window.sessionStorage.removeItem('refreshTimerId')
        }
        authServices.logout()
        setIsAuthenticated(false)
        setUserRole(null)
        router.push('/login')
    }

    const hasRole = (role: UserRole): boolean => {
        return userRole === role
    }

    const value = {
        isAuthenticated,
        userRole,
        login,
        signup,
        logout,
        hasRole,
        getUserId: authServices.getUserId
    }

    return (
        <AuthContext.Provider value={value}>
            {(!showContent || isLoading || isRefreshing) && <LoadingOverlay />}
            {showContent && (
                <Suspense fallback={<div>Loading...</div>}>
                    <SearchParamsProvider>
                        {() => {
                            return children
                        }}
                    </SearchParamsProvider>
                </Suspense>
            )}
        </AuthContext.Provider>
    )
} 