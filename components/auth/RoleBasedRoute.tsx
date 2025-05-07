"use client"

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { UserRole } from '@/services/authServices'

interface RoleBasedRouteProps {
    children: ReactNode
    allowedRoles: UserRole[]
    fallbackPath?: string
}

export default function RoleBasedRoute({
    children,
    allowedRoles,
    fallbackPath = '/'
}: RoleBasedRouteProps) {
    const { isAuthenticated, userRole } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // If user is not authenticated, this will be handled by AuthProvider's redirect
        if (!isAuthenticated) return

        console.log('userRole', userRole)
        // Role-based access check
        if (userRole && !allowedRoles.includes(userRole)) {
            router.push(fallbackPath)
        }
    }, [isAuthenticated, userRole, allowedRoles, fallbackPath, router])

    // Only render children if user has permission
    if (!isAuthenticated || !userRole || !allowedRoles.includes(userRole)) {
        return null
    }

    return <>{children}</>
} 