"use client"

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import {
    HomeIcon,
    UsersIcon,
    ArrowRightOnRectangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
}

interface SidebarProps {
    isSidebarOpen: boolean
    toggleSidebar: () => void
    closeMobileMenu: () => void
    pathname: string
}

export default function Sidebar({ isSidebarOpen, toggleSidebar, closeMobileMenu, pathname }: SidebarProps) {
    const { logout } = useAuth()

    const navItems: NavItem[] = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
    ]

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin'
        }
        return pathname.startsWith(href)
    }

    return (
        <div
            className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-800 shadow-lg z-30 transform transition-all ease-in-out duration-300 ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-16'
                }`}
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className={`text-xl font-semibold hidden lg:block  ${!isSidebarOpen ? 'lg:hidden' : ''}`}>Admin Panel</h2>
                <button
                    onClick={toggleSidebar}
                    className="hidden lg:block text-gray-500 hover:text-gray-600"
                    aria-label="Toggle sidebar"
                >
                    {isSidebarOpen ? (
                        <ChevronLeftIcon className="h-5 w-5" />
                    ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                    )}
                </button>
                <button
                    onClick={closeMobileMenu}
                    className="lg:hidden text-gray-500 hover:text-gray-600"
                    aria-label="Close mobile sidebar">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="flex flex-col h-[calc(100%-64px)] justify-between">
                <nav className={`${isSidebarOpen ? "p-4":""}`}>
                    <ul className="space-y-2">
                        {navItems.map((item) => {
                            const ItemIcon = item.icon
                            const active = isActive(item.href)
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center p-3 rounded-md transition-colors ${active
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            } ${!isSidebarOpen ? 'lg:justify-center' : ''}`}
                                        title={!isSidebarOpen ? item.name : ''}
                                    >
                                        <ItemIcon className={`h-5 w-5 ${isSidebarOpen ? 'mr-3 ' : ''}`} />
                                        <span className={!isSidebarOpen ? 'lg:hidden' : ''}>{item.name}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Logout button */}
                <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={logout}
                        className={`w-full flex items-center p-3 rounded-md transition-colors text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 ${!isSidebarOpen ? 'lg:justify-center' : ''
                            }`}
                        aria-label="Logout"
                        title={!isSidebarOpen ? 'Logout' : ''}
                    >
                        <ArrowRightOnRectangleIcon className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
                        <span className={!isSidebarOpen ? 'lg:hidden' : ''}>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    )
} 