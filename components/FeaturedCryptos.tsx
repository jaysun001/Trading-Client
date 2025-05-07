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

interface FeaturedCryptosProps {
    featuredCryptos: CryptoInfo[]
}

export default function FeaturedCryptos({ featuredCryptos }: FeaturedCryptosProps) {
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
            const promises = featuredCryptos.map(async (crypto) => {
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
                featuredCryptos.map(crypto => ({
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
    }, [featuredCryptos])

    // Set up initial data fetch and WebSocket connections
    useEffect(() => {
        // Initial data fetch
        fetchCryptoPrices()

        // Set up WebSocket connections for real-time updates
        const connections = featuredCryptos.map(crypto => {
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
    }, [featuredCryptos, fetchCryptoPrices, updateCryptoPrice])

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price)
    }

    return (
        <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Featured Cryptocurrencies</h2>
            {loading ? (
                <div className="flex justify-center my-8">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cryptos.map((crypto) => (
                        <Link
                            key={crypto.id}
                            href={`/crypto/${crypto.id}`}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl mr-4">
                                    {crypto.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{crypto.name}</h2>
                                    <p className="text-gray-500 dark:text-gray-400">{crypto.symbol}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-bold">{formatPrice(crypto.price)}</span>
                                    <span className={`${crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
} 