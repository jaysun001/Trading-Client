"use client"

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { CryptoInfo } from "../config/supported-cryptos"

interface CryptoCurrency {
    id: string
    name: string
    symbol: string
    icon: string
    price: number
    change24h: number
}

interface CryptoTableProps {
    cryptoList: CryptoInfo[]
}

export default function CryptoTable({ cryptoList }: CryptoTableProps) {
    const [cryptos, setCryptos] = useState<CryptoCurrency[]>([])
    const [loading, setLoading] = useState(true)

    // Update a single crypto's price with WebSocket data
    const updateCryptoPrice = useCallback((id: string, price: number, change24h: number) => {
        setCryptos(prev =>
            prev.map(crypto =>
                crypto.id === id
                    ? { ...crypto, price, change24h }
                    : crypto
            )
        )
    }, [])

    // Fetch initial prices for all cryptos
    const fetchCryptoPrices = useCallback(async () => {
        try {
            // Create an array of promises for each API call
            const promises = cryptoList.map(async (crypto) => {
                const response = await fetch(
                    `/api/crypto?symbol=${crypto.binanceSymbol}`
                )

                if (!response.ok) {
                    throw new Error(`Failed to fetch data for ${crypto.name}`)
                }

                const data = await response.json()

                return {
                    id: crypto.id,
                    name: crypto.name,
                    symbol: crypto.symbol,
                    icon: crypto.icon,
                    price: parseFloat(data.lastPrice),
                    change24h: parseFloat(data.priceChangePercent),
                }
            })

            // Wait for all promises to resolve
            const results = await Promise.all(promises)
            setCryptos(results)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching crypto prices:", error)
            // Use basic info without prices if API fails
            setCryptos(
                cryptoList.map(crypto => ({
                    id: crypto.id,
                    name: crypto.name,
                    symbol: crypto.symbol,
                    icon: crypto.icon,
                    price: 0,
                    change24h: 0,
                }))
            )
            setLoading(false)
        }
    }, [cryptoList])

    // Set up initial data fetch and WebSocket connections
    useEffect(() => {
        fetchCryptoPrices()

        // Set up WebSocket connections for real-time updates
        const connections = cryptoList.map(crypto => {
            const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${crypto.binanceSymbol.toLowerCase()}@ticker`)

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                updateCryptoPrice(crypto.id, parseFloat(data.c), parseFloat(data.P))
            }

            return ws
        })

        // Clean up WebSocket connections
        return () => {
            connections.forEach(ws => ws.close())
        }
    }, [cryptoList, fetchCryptoPrices, updateCryptoPrice])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price)
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Market Quotation</h2>

            {loading ? (
                <div className="flex justify-center my-8">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium">Name</th>
                                <th className="py-3 px-4 text-right font-medium">Latest Price</th>
                                <th className="py-3 px-4 text-right font-medium">24h Change</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {cryptos.map((crypto) => (
                                <tr
                                    key={crypto.id}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    <td className="py-4 px-4">
                                        <Link href={`/crypto/${crypto.id}`} className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-lg mr-3">
                                                {crypto.icon}
                                            </div>
                                            <div>
                                                <div className="font-medium">{crypto.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{crypto.symbol}</div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="py-4 px-4 text-right font-medium">
                                        <Link href={`/crypto/${crypto.id}`} className="block">
                                            {formatPrice(crypto.price)}
                                        </Link>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <Link href={`/crypto/${crypto.id}`} className="block">
                                            <span className={`inline-block px-3 py-1 rounded-full ${crypto.change24h >= 0
                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                }`}>
                                                {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                                            </span>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
} 