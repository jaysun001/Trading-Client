import { ElementType } from 'react'

interface AdminInfoCardProps {
    title: string
    value: string
    icon: ElementType
    color: string
}

export default function AdminInfoCard({ title, value, icon: Icon, color }: AdminInfoCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className={`${color} h-2`}></div>
            <div className="p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                    </div>
                    <div className={`${color} p-3 rounded-full bg-opacity-20 dark:bg-opacity-20`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </div>
    )
} 