"use client"

import { useState, useEffect } from 'react'
import apiService from '@/services/apiService'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/components/auth/AuthProvider'

interface TradeOption {
    duration: number // in seconds
    durationText: string
    profitPercentage: number
    selected: boolean
}

interface TradeFormProps {
    onCancel: () => void
    direction: 'up' | 'down'
    cryptoName: string
    currentPrice: number
}

export default function TradeForm({ onCancel, direction, cryptoName, currentPrice }: TradeFormProps) {
    const { getUserId } = useAuth()
    // Trade options as per requirements
    const [tradeOptions, setTradeOptions] = useState<TradeOption[]>([
        { duration: 180, durationText: '180S', profitPercentage: 30, selected: true },
        { duration: 120, durationText: '120S', profitPercentage: 40, selected: false },
        { duration: 60, durationText: '60S', profitPercentage: 60, selected: false },
    ])

    const [amount, setAmount] = useState<string>('100')
    const [estimatedEarnings, setEstimatedEarnings] = useState<number>(0)
    const [walletBalance, setWalletBalance] = useState(6500) // Initial hardcoded value
    const [isLoading, setIsLoading] = useState(false)

    // Calculate estimated earnings whenever amount or selected option changes
    useEffect(() => {
        const selectedOption = tradeOptions.find(option => option.selected)
        if (selectedOption && amount) {
            const parsedAmount = parseFloat(amount)
            if (!isNaN(parsedAmount)) {
                setEstimatedEarnings((parsedAmount * selectedOption.profitPercentage) / 100)
            } else {
                setEstimatedEarnings(0)
            }
        }
    }, [amount, tradeOptions])

    const handleSelectOption = (index: number) => {
        const updatedOptions = tradeOptions.map((option, i) => ({
            ...option,
            selected: i === index
        }))
        setTradeOptions(updatedOptions)
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        // Only allow numeric input
        if (/^\d*$/.test(value)) {
            setAmount(value)
        }
    }

    const handleSubmit = async () => {
        const selectedOption = tradeOptions.find(option => option.selected)
        if (!selectedOption) return

        try {
            setIsLoading(true)
            const now = new Date()
            const deliveryTime = new Date(now.getTime() + selectedOption.duration * 1000)

            // Format the term code as YYYYMMDDHHII (year, month, day, hour, minute)
            const termCode = `${deliveryTime.getFullYear()}${String(deliveryTime.getMonth() + 1).padStart(2, '0')}${String(deliveryTime.getDate()).padStart(2, '0')}${String(deliveryTime.getHours()).padStart(2, '0')}${String(deliveryTime.getMinutes()).padStart(2, '0')}`

            // Calculate estimated delivery price based on current price and profit percentage
            const estimatedDeliveryPrice = currentPrice * (1 + (selectedOption.profitPercentage / 100) * (direction === 'up' ? 1 : -1))

            // Create the payload
            const payload = {
                Name: cryptoName,
                TermCode: termCode,
                OpeningPrice: currentPrice,
                DeliveryPrice: estimatedDeliveryPrice,
                Direction: direction,
                Time: selectedOption.duration,
                BuyAmount: parseFloat(amount),
                openingTime: now.toISOString(),
                deliveryTime: deliveryTime.toISOString(),
                profit: `+${estimatedEarnings}`,
                userId: getUserId()
            }

            // Make API call using apiService
            const data = await apiService.trading.createOrder(payload)

            if (data.success) {
                // toast.success(data.message)
                // Update wallet balance if provided in response
                if (data.updatedWalletBalance !== undefined) {
                    setWalletBalance(data.updatedWalletBalance)
                }
                // Reset form and close
                onCancel()
            } else {
                // toast.error(data.message || 'Failed to create order')
            }
        } catch (error: unknown) {
            console.error('Error submitting trade:', error)
            // toast.error('Failed to submit trade. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const isSubmitDisabled = parseFloat(amount) < 100 || parseFloat(amount) > walletBalance || isLoading

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden max-w-md w-full animate-fadeIn">
            {/* Modal header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900">
                <h3 className="text-lg font-semibold text-white">
                    {direction === 'up' ? 'Buy Long' : 'Buy Short'} - {cryptoName}
                </h3>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="p-5">
                {/* Current price info */}
                <div className="mb-4 p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-sm text-gray-400">Current Price</div>
                    <div className="text-xl font-semibold text-white">${currentPrice.toFixed(2)}</div>
                </div>

                {/* Time scale options */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {tradeOptions.map((option, index) => (
                        <div
                            key={option.duration}
                            className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${option.selected
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-700 hover:border-gray-500'}`}
                            onClick={() => handleSelectOption(index)}
                        >
                            <div className="text-center font-medium">{option.durationText}</div>
                            <div className="text-center text-gray-400 text-sm">Scale {option.profitPercentage}%</div>
                        </div>
                    ))}
                </div>

                {/* Amount input */}
                <div className="mb-4">
                    <div className="flex justify-between mb-2">
                        <label className="text-gray-300">Amount</label>
                        <div className="text-gray-300">Handling Fee: 0%</div>
                    </div>
                    <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount"
                        className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        disabled={isLoading}
                    />
                    <div className="text-sm text-gray-400 mt-1">Minimum Amount 100</div>
                </div>

                {/* Balance and estimated earnings */}
                <div className="flex justify-between mb-6 text-gray-300">
                    <div>Balance: {walletBalance}</div>
                    <div>Estimated Earnings: {estimatedEarnings.toFixed(2)}</div>
                </div>

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className={`w-full py-4 text-white font-bold rounded-lg transition-colors ${direction === 'up'
                        ? isSubmitDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                        : isSubmitDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                        }`}
                >
                    {isLoading ? 'Processing...' : `Submit ${direction === 'up' ? 'Long' : 'Short'} Order`}
                </button>
            </div>
        </div>
    )
} 