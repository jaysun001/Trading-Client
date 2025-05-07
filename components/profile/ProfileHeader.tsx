"use client"

import { useState } from 'react'
import Image from 'next/image'

interface ProfileHeaderProps {
    name: string
    email: string
    joinDate?: string
}

export default function ProfileHeader({ name, email, joinDate }: ProfileHeaderProps) {
    const [avatarError, setAvatarError] = useState(false)
    const formattedName = name || 'User'
    const initials = formattedName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    // Get join date as Month Year
    const formatJoinDate = () => {
        if (!joinDate) return 'Member'

        const date = new Date(joinDate)
        const month = date.toLocaleString('default', { month: 'long' })
        const year = date.getFullYear()
        return `Member since ${month} ${year}`
    }

    return (
        <div className="relative mb-12">
            {/* Trading platform style background */}
            <div className="h-40 bg-gray-900 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/70">
                    {/* Trading platform pattern overlay */}
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2px, transparent 0)`,
                            backgroundSize: '100px 100px'
                        }}>
                    </div>
                    {/* Trading chart lines - simulated */}
                    <svg className="absolute bottom-0 left-0 right-0 w-full h-20 opacity-20" viewBox="0 0 1000 200">
                        <path d="M0,100 Q250,180 500,80 T1000,100" fill="none" stroke="rgba(134, 239, 172, 0.8)" strokeWidth="2" />
                        <path d="M0,150 Q250,100 500,150 T1000,120" fill="none" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" />
                    </svg>
                </div>
            </div>

            {/* Profile info - Trading platform style */}
            <div className="absolute -bottom-1 left-0 right-0 px-6">
                <div className="flex flex-col items-center text-center">
                    {/* Avatar/Initials in trading style */}
                    <div className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center">
                        {!avatarError ? (
                            <Image
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=0057FF`}
                                alt={name}
                                width={96}
                                height={96}
                                onError={() => setAvatarError(true)}
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-white">{initials}</span>
                        )}
                    </div>

                    {/* User info - Trading style */}
                    <div className="mt-2 text-center">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                            {name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {email}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full inline-block">
                            {formatJoinDate()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 