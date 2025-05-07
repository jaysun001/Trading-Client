"use client"

import { useState } from 'react'
import TradeForm from './TradeForm'

interface TradingButtonsProps {
    cryptoName: string
    currentPrice: number
}

export default function TradingButtons({ cryptoName, currentPrice }: TradingButtonsProps) {
    const [showTradeForm, setShowTradeForm] = useState(false)
    const [tradeDirection, setTradeDirection] = useState<'up' | 'down' | null>(null)

    const handleTradeClick = (direction: 'up' | 'down') => {
        setTradeDirection(direction)
        setShowTradeForm(true)
    }

    const handleCancel = () => {
        setShowTradeForm(false)
        setTradeDirection(null)
    }

    return (
        <div className="mt-6">
            {!showTradeForm ? (
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleTradeClick('up')}
                        className="py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md transition-colors"
                    >
                        Up
                    </button>
                    <button
                        onClick={() => handleTradeClick('down')}
                        className="py-4 px-6 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors"
                    >
                        Down
                    </button>
                </div>
            ) : (
                showTradeForm && tradeDirection && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="relative max-w-md w-full">
                            <TradeForm
                                onCancel={handleCancel}
                                direction={tradeDirection}
                                cryptoName={cryptoName}
                                currentPrice={currentPrice}
                            />
                        </div>
                    </div>
                )
            )}
        </div>
    )
} 