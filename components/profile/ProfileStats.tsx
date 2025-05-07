"use client"

import {
    StarIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface ProfileStatsProps {
    crdScore: number
}

export default function ProfileStats({ crdScore }: ProfileStatsProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Profile Statistics</h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CRD Score */}
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <StarIcon className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">CRD Score</p>
                        <p className="text-xl font-semibold text-gray-800 dark:text-white">{crdScore}</p>
                    </div>
                </div>

                {/* Account Status */}
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <ShieldCheckIcon className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                        <div className="flex items-center">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 