"use client"

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import {
    UserGroupIcon,
    UserPlusIcon,
    CurrencyDollarIcon,
    KeyIcon,
    UserCircleIcon,
    HomeIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'

interface AdminSidebarProps {
    currentPath: string
}

const navigationItems = [
    { name: 'Dashboard', path: '/admin', icon: HomeIcon },
    { name: 'Create User', path: '/admin/create-user', icon: UserPlusIcon },
    { name: 'Find User', path: '/admin/find-user', icon: UserCircleIcon },
    { name: 'Update Balance', path: '/admin/update-balance', icon: CurrencyDollarIcon },
    { name: 'Update Password', path: '/admin/update-password', icon: KeyIcon },
    { name: 'All Users', path: '/admin/users', icon: UserGroupIcon },
]

export default function AdminSidebar({ currentPath }: AdminSidebarProps) {
    const { logout } = useAuth()

    return (
        <div className="fixed w-64 h-full bg-gray-800 text-white shadow-lg">
            <div className="p-6 border-b border-gray-700">
                <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>

            <nav className="mt-6">
                <ul>
                    {navigationItems.map((item) => {
                        const isActive = currentPath === item.path ||
                            (item.path !== '/admin' && currentPath?.startsWith(item.path))

                        return (
                            <li key={item.path} className="mb-2">
                                <Link
                                    href={item.path}
                                    className={`flex items-center px-6 py-3 hover:bg-gray-700 transition-colors ${isActive ? 'bg-blue-600 text-white' : ''
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            </li>
                        )
                    })}

                    <li className="mt-6">
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-6 py-3 text-red-400 hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
} 