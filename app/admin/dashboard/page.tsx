"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import LogoutButton from "@/components/auth/LogoutButton"

export default function AdminDashboard() {
    const { userRole } = useAuth()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <LogoutButton />
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Welcome, Admin</h2>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                        Role: {userRole}
                    </span>
                </div>

                <p className="text-gray-300 mb-4">
                    This is a protected admin dashboard. Only users with admin role can access this page.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-2">Users</h3>
                        <p className="text-gray-300">Manage platform users</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-2">Transactions</h3>
                        <p className="text-gray-300">View trading history</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-2">Settings</h3>
                        <p className="text-gray-300">Configure platform settings</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-white font-medium mb-2">Analytics</h3>
                        <p className="text-gray-300">View platform metrics</p>
                    </div>
                </div>
            </div>
        </div>
    )
} 