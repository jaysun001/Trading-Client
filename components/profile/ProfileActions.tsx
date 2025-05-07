"use client"

import {
    Cog6ToothIcon,
    ShieldExclamationIcon,
    CreditCardIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/components/auth/AuthProvider'

export default function ProfileActions() {
    const { logout } = useAuth()

    const actionItems = [
        {
            name: 'Settings',
            icon: <Cog6ToothIcon className="h-5 w-5" />,
            onClick: () => console.log('Settings clicked'),
            color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
        },
        {
            name: 'Security',
            icon: <ShieldExclamationIcon className="h-5 w-5" />,
            onClick: () => console.log('Security clicked'),
            color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
        },
        {
            name: 'Payment Methods',
            icon: <CreditCardIcon className="h-5 w-5" />,
            onClick: () => console.log('Payment clicked'),
            color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
        },
        {
            name: 'Logout',
            icon: <ArrowRightOnRectangleIcon className="h-5 w-5" />,
            onClick: logout,
            color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }
    ]

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Actions</h2>
            </div>

            <div className="p-2">
                {actionItems.map((item, index) => (
                    <button
                        key={index}
                        onClick={item.onClick}
                        className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                    >
                        <div className={`p-2 rounded-lg ${item.color}`}>
                            {item.icon}
                        </div>
                        <span className="text-gray-700 dark:text-gray-200 font-medium">
                            {item.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
} 