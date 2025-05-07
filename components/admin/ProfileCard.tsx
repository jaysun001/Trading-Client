"use client"

import { ReactNode } from 'react'

interface ProfileDetail {
    icon: ReactNode
    label: string
    value: string
    bgColor: string
    iconColor: string
}

interface AdminDetails {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
}

interface ProfileCardProps {
    adminDetails: AdminDetails
    formatDate: (date: string) => string
}

export default function ProfileCard({ adminDetails, formatDate }: ProfileCardProps) {
    const details: ProfileDetail[] = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
            ),
            label: 'Email Address',
            value: adminDetails.email,
            bgColor: 'bg-blue-900',
            iconColor: 'text-blue-400',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
            ),
            label: 'Admin ID',
            value: adminDetails.id,
            bgColor: 'bg-purple-900',
            iconColor: 'text-purple-400',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            ),
            label: 'Role',
            value: adminDetails.role.charAt(0).toUpperCase() + adminDetails.role.slice(1),
            bgColor: 'bg-green-900',
            iconColor: 'text-green-400',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
            ),
            label: 'Account Created',
            value: formatDate(adminDetails.createdAt),
            bgColor: 'bg-amber-900',
            iconColor: 'text-amber-400',
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
            ),
            label: 'Last Updated',
            value: formatDate(adminDetails.updatedAt),
            bgColor: 'bg-teal-900',
            iconColor: 'text-teal-400',
        },
    ]

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-12">
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-blue-400 mb-4">
                        <span className="text-4xl font-bold">
                            {adminDetails.name.split(' ').map(n => n[0]).join('')}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{adminDetails.name}</h2>
                    <p className="text-blue-100">{adminDetails.role.charAt(0).toUpperCase() + adminDetails.role.slice(1)}</p>
                </div>
            </div>
            {/* Admin details */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {details.map((detail, index) => (
                        <div key={index} className="flex items-center p-4 bg-gray-750 rounded-lg">
                            <div className={`p-3 ${detail.bgColor} rounded-full ${detail.iconColor} mr-4`}>
                                {detail.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{detail.label}</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100 break-all">{detail.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-gray-600 dark:text-gray-400">
                    You have administrator privileges for this trading platform.
                </p>
            </div>
        </div>
    )
} 