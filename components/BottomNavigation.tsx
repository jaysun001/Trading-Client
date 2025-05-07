"use client"

import { usePathname, useRouter } from 'next/navigation'
import { HomeIcon, ArrowsRightLeftIcon, ClipboardDocumentListIcon, UserIcon } from '@heroicons/react/24/outline'
import {
    HomeIcon as HomeIconSolid, ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
    ClipboardDocumentListIcon as ClipboardDocumentListIconSolid, UserIcon as UserIconSolid
} from '@heroicons/react/24/solid'
import { useAuth } from './auth/AuthProvider'

export default function BottomNavigation() {
    const pathname = usePathname()
    const router = useRouter()
    const { isAuthenticated, userRole } = useAuth()

    // Don't render navigation for unauthenticated users or on login/signup pages
    if (!isAuthenticated || pathname === '/login' || pathname === '/signup') {
        return null
    }

    // Don't render bottom navigation for admin users
    if (userRole === 'admin') {
        return null
    }

    // Check if the current pathname is a crypto page
    const isCryptoPage = pathname ? pathname.startsWith('/crypto/') : false

    // Define navigation items
    const navItems = [
        {
            name: 'Home',
            path: '/',
            icon: pathname === '/' ? <HomeIconSolid className="h-6 w-6" /> : <HomeIcon className="h-6 w-6" />,
            active: pathname === '/'
        },
        {
            name: 'Trade',
            path: '/crypto/bitcoin',
            icon: isCryptoPage ? <ArrowsRightLeftIconSolid className="h-6 w-6" /> : <ArrowsRightLeftIcon className="h-6 w-6" />,
            active: isCryptoPage
        },
        {
            name: 'Record',
            path: '/futureshistory',
            icon: pathname === '/futureshistory' ? <ClipboardDocumentListIconSolid className="h-6 w-6" /> : <ClipboardDocumentListIcon className="h-6 w-6" />,
            active: pathname === '/futureshistory'
        },
        {
            name: 'Mine',
            path: '/mine',
            icon: pathname === '/mine' ? <UserIconSolid className="h-6 w-6" /> : <UserIcon className="h-6 w-6" />,
            active: pathname === '/mine'
        }
    ]

    const handleNavigation = (path: string) => {
        router.push(path)
    }

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-black border-t border-gray-800">
            <div className="grid h-full grid-cols-4 mx-auto">
                {navItems.map((item) => (
                    <button
                        key={item.name}
                        type="button"
                        onClick={() => handleNavigation(item.path)}
                        className={`inline-flex flex-col items-center justify-center px-5 ${item.active ? 'text-yellow-500' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
} 