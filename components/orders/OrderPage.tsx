"use client"

import { useState } from 'react'
import OpenOrder from './OpenOrder'
import HistoryOrders from './HistoryOrders'

const OrderPage = () => {
    const [activeTab, setActiveTab] = useState<'open' | 'history'>('open')

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="container mx-auto px-4 py-8">
                {/* Toggle Button */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-800 p-1 rounded-lg inline-flex">
                        <button
                            onClick={() => setActiveTab('open')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'open'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Open Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'history'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Order History
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    {activeTab === 'open' ? (
                        <OpenOrder />
                    ) : (
                        <HistoryOrders />
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrderPage