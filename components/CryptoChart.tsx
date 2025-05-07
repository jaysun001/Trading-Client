"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import {
    createChart,
    ColorType,
    UTCTimestamp
} from "lightweight-charts"
import { getCryptoById } from "../config/supported-cryptos"

interface CryptoChartProps {
    cryptoId: string
}

interface CandleData {
    time: UTCTimestamp
    open: number
    high: number
    low: number
    close: number
}

interface VolumeData {
    time: UTCTimestamp
    value: number
    color: string
}

export default function CryptoChart({ cryptoId }: CryptoChartProps) {


    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)
    const candlestickSeriesRef = useRef<any>(null)
    const volumeSeriesRef = useRef<any>(null)
    const [interval, setInterval] = useState<string>("1m")
    const [isLoading, setIsLoading] = useState<boolean>(true)
    // Track the latest data points to prevent time ordering issues
    const candleDataRef = useRef<CandleData[]>([])
    const volumeDataRef = useRef<VolumeData[]>([])
    // Track whether component is mounted
    const isMounted = useRef<boolean>(true)

    // Get binanceSymbol from the supported cryptocurrencies configuration
    const cryptoDetails = getCryptoById(cryptoId)
    const cryptoSymbol = cryptoDetails ? cryptoDetails.binanceSymbol : "BTCUSDT"

    // Set isMounted to false when component unmounts
    useEffect(() => {
        isMounted.current = true

        return () => {
            isMounted.current = false
        }
    }, [])

    // Initialize the chart
    useEffect(() => {
        // Don't initialize if not mounted or no container
        if (!chartContainerRef.current || !isMounted.current) return

        // Store the container reference for cleanup
        const containerRef = chartContainerRef.current

        // Clear previous chart if it exists
        if (chartRef.current) {
            chartRef.current.remove()
            chartRef.current = null
            candlestickSeriesRef.current = null
            volumeSeriesRef.current = null
        }

        try {
            // Create chart with proper type casting to avoid TypeScript errors
            const chart = createChart(containerRef, {
                layout: {
                    background: { type: ColorType.Solid, color: "transparent" },
                    textColor: "#d1d4dc",
                },
                grid: {
                    vertLines: { color: "rgba(42, 46, 57, 0.5)" },
                    horzLines: { color: "rgba(42, 46, 57, 0.5)" },
                },
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                    borderColor: "rgba(197, 203, 206, 0.3)",
                },
                rightPriceScale: {
                    borderColor: "rgba(197, 203, 206, 0.3)",
                },
                crosshair: {
                    mode: 1,
                },
                width: containerRef.clientWidth,
                height: 500,
            })

            // Create series without type checking
            const candlestickSeries = chart.addCandlestickSeries({
                upColor: "#26a69a",
                downColor: "#ef5350",
                borderVisible: false,
                wickUpColor: "#26a69a",
                wickDownColor: "#ef5350",
            })

            const volumeSeries = chart.addHistogramSeries({
                color: "#26a69a",
                priceFormat: {
                    type: "volume",
                },
                priceScaleId: "",
            })

            // Set up references
            chartRef.current = chart
            candlestickSeriesRef.current = candlestickSeries
            volumeSeriesRef.current = volumeSeries

            // Enable zooming with mouse wheel - custom implementation for v3.8.0
            chart.timeScale().fitContent()

            // Custom mouse wheel zoom handler
            const handleMouseWheel = (e: WheelEvent) => {
                e.preventDefault()

                if (!chartRef.current) return

                const timeScale = chart.timeScale()

                // Get visible range
                const logicalRange = timeScale.getVisibleLogicalRange()
                if (logicalRange === null) return

                // Calculate zoom factor
                const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1 // Zoom in (smaller range) or out (larger range)

                // Apply zoom by modifying the visible range
                const newRange = {
                    from: logicalRange.from - (logicalRange.from - logicalRange.to) * (zoomFactor - 1) * 0.5,
                    to: logicalRange.to + (logicalRange.from - logicalRange.to) * (zoomFactor - 1) * 0.5,
                }

                timeScale.setVisibleLogicalRange(newRange)
            }

            if (containerRef) {
                containerRef.addEventListener('wheel', handleMouseWheel)
            }

            // Handle resizing
            const handleResize = () => {
                if (containerRef && chartRef.current && isMounted.current) {
                    chartRef.current.applyOptions({
                        width: containerRef.clientWidth,
                    })
                }
            }

            window.addEventListener("resize", handleResize)

            // Cleanup
            return () => {
                window.removeEventListener("resize", handleResize)
                if (containerRef) {
                    containerRef.removeEventListener('wheel', handleMouseWheel)
                }
                // Clear chart resources
                if (chartRef.current) {
                    try {
                        chartRef.current.remove()
                    } catch (error) {
                        console.log("Error removing chart:", error)
                    }
                    chartRef.current = null
                    candlestickSeriesRef.current = null
                    volumeSeriesRef.current = null
                }
            }
        } catch (error) {
            console.log("Error creating chart:", error)
            return () => { }
        }
    }, [cryptoId])

    // Load historical data and start WebSocket
    useEffect(() => {
        // Exit early if not mounted or missing series
        if (!isMounted.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) return

        let ws: WebSocket | null = null
        let reconnectTimeout: NodeJS.Timeout | null = null
        let reconnectAttempts = 0
        const maxReconnectAttempts = 5

        const fetchHistoricalData = async () => {
            setIsLoading(true)
            try {
                // Fetch historical klines using our API route
                const response = await fetch(
                    `/api/crypto/klines?symbol=${cryptoSymbol}&interval=${interval}&limit=1000`
                )

                if (!response.ok) {
                    throw new Error("Failed to fetch historical data")
                }

                // Check if still mounted
                if (!isMounted.current) return

                const data = await response.json()

                // Transform data for lightweight-charts
                const candleData: CandleData[] = data.map((item: any) => ({
                    time: (item[0] / 1000) as UTCTimestamp,
                    open: parseFloat(item[1]),
                    high: parseFloat(item[2]),
                    low: parseFloat(item[3]),
                    close: parseFloat(item[4]),
                }))

                const volumeData: VolumeData[] = data.map((item: any) => ({
                    time: (item[0] / 1000) as UTCTimestamp,
                    value: parseFloat(item[5]),
                    color: parseFloat(item[4]) >= parseFloat(item[1]) ? "#26a69a" : "#ef5350",
                }))

                // Check if still mounted and refs are valid
                if (!isMounted.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) return

                // Save the data to our refs
                candleDataRef.current = candleData
                volumeDataRef.current = volumeData

                // Set the data
                candlestickSeriesRef.current.setData(candleData)
                volumeSeriesRef.current.setData(volumeData)

                // Fit the chart to the data
                if (chartRef.current) {
                    chartRef.current.timeScale().fitContent()
                }

                setIsLoading(false)
            } catch (error) {
                console.log("Error fetching historical data:", error)
                if (isMounted.current) {
                    setIsLoading(false)
                }
            }
        }

        fetchHistoricalData()

        // Set up WebSocket connection with reconnection logic
        const connectWebSocket = () => {
            // Exit if component is unmounted or max reconnect attempts reached
            if (!isMounted.current || reconnectAttempts >= maxReconnectAttempts) {
                console.log("WebSocket not connecting: Component unmounted or max attempts reached")
                return
            }

            ws = new WebSocket(`wss://stream.binance.com:9443/ws/${cryptoSymbol.toLowerCase()}@kline_${interval}`)

            ws.onopen = () => {
                if (!isMounted.current) {
                    ws?.close()
                    return
                }
                console.log("WebSocket connected")
                reconnectAttempts = 0
            }

            ws.onmessage = (event) => {
                // Exit if component is unmounted
                if (!isMounted.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) return

                const message = JSON.parse(event.data)
                if (message.e === "kline") {
                    const kline = message.k

                    // Convert timestamp to UTCTimestamp
                    const timestamp = (kline.t / 1000) as UTCTimestamp

                    // Update the candlestick data
                    const candleData: CandleData = {
                        time: timestamp,
                        open: parseFloat(kline.o),
                        high: parseFloat(kline.h),
                        low: parseFloat(kline.l),
                        close: parseFloat(kline.c),
                    }

                    // Update the volume data
                    const volumeData: VolumeData = {
                        time: timestamp,
                        value: parseFloat(kline.v),
                        color: parseFloat(kline.c) >= parseFloat(kline.o) ? "#26a69a" : "#ef5350",
                    }

                    try {
                        // Check again if component is still mounted and refs are valid
                        if (!isMounted.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) return

                        // Use safe update approach to prevent time ordering errors
                        if (candlestickSeriesRef.current) {
                            // Get our stored data
                            const storedData = candleDataRef.current
                            const lastPoint = storedData.length > 0 ? storedData[storedData.length - 1] : null

                            // If this is a new candle (timestamp is greater than last point)
                            if (!lastPoint || lastPoint.time < timestamp) {
                                // Add to our stored data
                                candleDataRef.current = [...storedData, candleData]
                                // Update chart
                                candlestickSeriesRef.current.update(candleData)
                            }
                            // If this is updating the current candle (same timestamp)
                            else if (lastPoint.time === timestamp) {
                                // Update our stored data
                                const filteredData = storedData.filter((d: CandleData) => d.time !== timestamp)
                                candleDataRef.current = [...filteredData, candleData]
                                // Update chart - need to replace the whole dataset when updating same timestamp
                                candlestickSeriesRef.current.setData(candleDataRef.current)
                            }
                            // If data is old, ignore it to prevent ordering errors
                        }

                        if (volumeSeriesRef.current) {
                            // Same approach for volume data
                            const storedData = volumeDataRef.current
                            const lastPoint = storedData.length > 0 ? storedData[storedData.length - 1] : null

                            if (!lastPoint || lastPoint.time < timestamp) {
                                volumeDataRef.current = [...storedData, volumeData]
                                volumeSeriesRef.current.update(volumeData)
                            }
                            else if (lastPoint.time === timestamp) {
                                const filteredData = storedData.filter((d: VolumeData) => d.time !== timestamp)
                                volumeDataRef.current = [...filteredData, volumeData]
                                volumeSeriesRef.current.setData(volumeDataRef.current)
                            }
                        }
                    } catch (error) {
                        console.log("Error updating chart:", error)
                    }
                }
            }

            ws.onclose = (e) => {
                if (!isMounted.current) return

                console.log("WebSocket disconnected, attempting to reconnect...", e.code, e.reason)

                // Only attempt to reconnect if we haven't reached max attempts and component is still mounted
                if (reconnectAttempts < maxReconnectAttempts && isMounted.current) {
                    reconnectAttempts++

                    // Exponential backoff for reconnection attempts
                    const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)

                    reconnectTimeout = setTimeout(() => {
                        if (isMounted.current) {
                            connectWebSocket()
                        }
                    }, reconnectDelay)
                }
            }
            ws.onerror = (err) => {
                console.log("WebSocket error:", err)
                if (ws && isMounted.current) {
                    ws.close()
                }
            }
        }
        connectWebSocket()
        // Cleanup WebSocket connection and any pending reconnection attempts
        return () => {
            if (ws) {
                try {
                    ws.close()
                } catch (error) {
                    console.log("Error closing WebSocket:", error)
                }
            }

            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout)
            }
        }
    }, [cryptoId, cryptoSymbol, interval])

    const handleIntervalChange = (newInterval: string) => {
        setInterval(newInterval)
    }

    const timeframeButtons = [
        { label: "1m", value: "1m" },
        { label: "5m", value: "5m" },
        { label: "15m", value: "15m" },
        { label: "1h", value: "1h" },
        { label: "4h", value: "4h" },
        { label: "1d", value: "1d" },
    ]

    // Zoom in and out buttons with correct API
    const handleZoomIn = () => {
        if (!chartRef.current) return

        const timeScale = chartRef.current.timeScale()
        const logicalRange = timeScale.getVisibleLogicalRange()

        if (logicalRange !== null) {
            const rangeSize = logicalRange.to - logicalRange.from
            const newRangeSize = rangeSize * 0.7 // Zoom in by reducing range size
            const center = (logicalRange.from + logicalRange.to) / 2

            timeScale.setVisibleLogicalRange({
                from: center - newRangeSize / 2,
                to: center + newRangeSize / 2,
            })
        }
    }

    const handleZoomOut = () => {
        if (!chartRef.current) return

        const timeScale = chartRef.current.timeScale()
        const logicalRange = timeScale.getVisibleLogicalRange()

        if (logicalRange !== null) {
            const rangeSize = logicalRange.to - logicalRange.from
            const newRangeSize = rangeSize * 1.4 // Zoom out by increasing range size
            const center = (logicalRange.from + logicalRange.to) / 2

            timeScale.setVisibleLogicalRange({
                from: center - newRangeSize / 2,
                to: center + newRangeSize / 2,
            })
        }
    }

    const handleResetZoom = () => {
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent()
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col  mb-4">
                <h2 className="text-xl font-semibold">
                    {cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1)} Price Chart
                </h2>
                <div className="flex flex-col-reverse gap-5 md:flex-row items-center">
                    <div className="flex space-x-2 mr-4">
                        <button
                            className="px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={handleZoomIn}
                            title="Zoom In"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                        <button
                            className="px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={handleZoomOut}
                            title="Zoom Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                            </svg>
                        </button>
                        <button
                            className="px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                            onClick={handleResetZoom}
                            title="Reset Zoom"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        {timeframeButtons.map((btn) => (
                            <button
                                key={btn.value}
                                className={`px-3 py-1 text-sm rounded ${interval === btn.value
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                                onClick={() => handleIntervalChange(btn.value)}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-800/75 z-10">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                        </div>
                    )}
                    <div ref={chartContainerRef} className="w-full h-full" />
                </div>
            </div>
        </div>
    )
} 