"use client"

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import CryptoChart from "../../../components/CryptoChart"
import PriceInfo from "../../../components/PriceInfo"
import TradingButtons from "../../../components/TradingButtons"
import { CryptoInfo, getCryptoById } from "../../../config/supported-cryptos"

interface CryptoData {
    id: string
    name: string
    symbol: string
    price: number
    change24h: number
    high24h: number
    low24h: number
    volume24h: number
    marketCap: number
}

interface CryptoDetailClientProps {
    cryptoId: string
}

// Define a type for Binance ticker data
interface BinanceTickerData {
    c: string  // Last price
    P: string  // Price change percent
    h: string  // High price
    l: string  // Low price
    v: string  // Volume
    [key: string]: string  // For other properties
}

export default function CryptoDetailClient({ cryptoId }: CryptoDetailClientProps) {
    const [crypto, setCrypto] = useState<CryptoData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCryptoData = useCallback(async (cryptoDetails: CryptoInfo) => {
        try {
            const binanceSymbol = cryptoDetails.binanceSymbol

            // Use our API route instead of directly calling Binance
            const response = await fetch(
                `/api/crypto?symbol=${binanceSymbol}`
            )

            if (!response.ok) {
                throw new Error("Failed to fetch data from API")
            }

            const data = await response.json()

            // Parse and set the crypto data
            setCrypto({
                id: cryptoId,
                name: cryptoDetails.name,
                symbol: cryptoDetails.symbol,
                price: parseFloat(data.lastPrice),
                change24h: parseFloat(data.priceChangePercent),
                high24h: parseFloat(data.highPrice),
                low24h: parseFloat(data.lowPrice),
                volume24h: parseFloat(data.volume),
                marketCap: cryptoDetails.marketCap,
            })

            setLoading(false)
        } catch (error) {
            console.error("Error fetching crypto data:", error)
            setError("Failed to load cryptocurrency data")
            setLoading(false)
        }
    }, [cryptoId])

    useEffect(() => {
        const cryptoDetails = getCryptoById(cryptoId)

        if (!cryptoDetails) {
            setError("Cryptocurrency not found")
            setLoading(false)
            return
        }

        // Initial fetch to get data right away
        fetchCryptoData(cryptoDetails)

        // Set up WebSocket for real-time updates
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${cryptoDetails.binanceSymbol.toLowerCase()}@ticker`)

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data) as BinanceTickerData
            updateCryptoData(cryptoDetails, data)
        }

        return () => {
            // Close WebSocket on component unmount
            ws.close()
        }
    }, [cryptoId, fetchCryptoData])

    const updateCryptoData = (cryptoDetails: CryptoInfo, data: BinanceTickerData) => {
        setCrypto(prev => {
            if (!prev) return null

            return {
                ...prev,
                price: parseFloat(data.c),
                change24h: parseFloat(data.P),
                high24h: parseFloat(data.h),
                low24h: parseFloat(data.l),
                volume24h: parseFloat(data.v),
            }
        })
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">{error}</h1>
                <Link href="/" className="text-blue-500 hover:underline">
                    Return to homepage
                </Link>
            </div>
        )
    }

    if (loading || !crypto) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
                <p>Loading cryptocurrency data...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <main className="container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center">
                    <Link href="/" className="text-blue-500 hover:underline mr-4">
                        &larr; Back to list
                    </Link>
                    <h1 className="text-3xl font-bold">{crypto.name} ({crypto.symbol})</h1>
                    <span className="ml-4 text-gray-500">${crypto.price.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-[600px]">
                            <CryptoChart cryptoId={cryptoId} />
                        </div>

                        {/* Trading buttons */}
                        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Trade {crypto.name}</h2>
                            <TradingButtons
                                cryptoName={crypto.name}
                                currentPrice={crypto.price}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <PriceInfo crypto={crypto} isRealTime={true} />
                    </div>
                </div>
            </main>
        </div>
    )
} 