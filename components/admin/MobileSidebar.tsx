"use client"

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import {
    HomeIcon,
    UsersIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'

interface NavItem {
    name: string
    href: string
    icon: React.ElementType
}

interface MobileSidebarProps {
    isOpen: boolean
    onClose: () => void
    pathname: string
}

export default function MobileSidebar({ isOpen, onClose, pathname }: MobileSidebarProps) {
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

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />

            <div
                className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform ease-in-out duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Admin Panel</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-600"
                        aria-label="Close mobile menu"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100%-64px)] justify-between">
                    <nav className="p-4">
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const ItemIcon = item.icon
                                const active = isActive(item.href)

                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={onClose}
                                            className={`flex items-center p-3 rounded-md transition-colors ${active
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <ItemIcon className="h-5 w-5 mr-3" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    {/* Logout button for mobile */}
                    <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={logout}
                            className="w-full flex items-center p-3 rounded-md transition-colors text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 