"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/admin/Sidebar'
import MobileSidebar from '@/components/admin/MobileSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [pathname])

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false)
            } else {
                setIsSidebarOpen(true)
            }
        }

        // Set initial state
        handleResize()

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className={ ` ${isMobileMenuOpen ? "hidden" :"block"} p-2 rounded-md bg-white dark:bg-gray-800 shadow-md`}
                    aria-label="Open mobile menu"
                >
                    <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
                pathname={pathname || ''}
            />

            {/* Desktop Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                closeMobileMenu={closeMobileMenu}
                pathname={pathname || ''}
            />

            {/* Main content */}
            <div
                className={`transition-all duration-300 ease-in-out ${isSidebarOpen
                    ? 'lg:pl-64'
                    : 'lg:pl-16 pl-0'
                    }`}
            >
                <div className="min-h-screen p-4 pt-16 lg:pt-4 sm:p-6 md:p-8">
                    {children}
                </div>
            </div>
        </div>
    )
} 