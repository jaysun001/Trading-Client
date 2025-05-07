interface CryptoData {
    name: string
    symbol: string
    price: number
    change24h: number
    high24h: number
    low24h: number
    volume24h: number
}

interface PriceInfoProps {
    crypto: CryptoData
    isRealTime?: boolean
}

export default function PriceInfo({ crypto, isRealTime = true }: PriceInfoProps) {
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        }).format(num)
    }

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2,
        }).format(num)
    }

    const formatLargeNumber = (num: number) => {
        if (num >= 1_000_000_000_000) {
            return `${(num / 1_000_000_000_000).toFixed(2)}T`
        }
        if (num >= 1_000_000_000) {
            return `${(num / 1_000_000_000).toFixed(2)}B`
        }
        if (num >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(2)}M`
        }
        return formatNumber(num)
    }

    const isPositive = crypto.change24h >= 0
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500'
    const changeSymbol = isPositive ? '↑' : '↓'

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Price Information</h2>
                {isRealTime && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Real-time
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <div className="transition-all duration-300 ease-in-out">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm">Current Price</h3>
                    <p className="text-2xl font-bold">{formatCurrency(crypto.price)}</p>
                </div>

                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm">24h Change</h3>
                    <p className={`text-lg font-semibold ${changeColor} flex items-center`}>
                        <span className="mr-1">{changeSymbol}</span>
                        <span className="px-2 py-1 rounded-full text-sm bg-opacity-20 inline-block"
                            style={{
                                backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            }}
                        >
                            {Math.abs(crypto.change24h).toFixed(2)}%
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">24h High</h3>
                        <p className="font-medium">{formatCurrency(crypto.high24h)}</p>
                    </div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm">24h Low</h3>
                        <p className="font-medium">{formatCurrency(crypto.low24h)}</p>
                    </div>
                </div>

                <div>
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm">24h Volume</h3>
                    <p className="font-medium">{formatLargeNumber(crypto.volume24h)}</p>
                </div>
            </div>
        </div>
    )
} 