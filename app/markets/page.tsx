import Link from "next/link"

// Mock crypto data
const cryptoCurrencies = [
    {
        id: "bitcoin",
        name: "Bitcoin",
        symbol: "BTC",
        price: 50000,
        change24h: 2.5,
        marketCap: 950000000000,
        volume24h: 28000000000,
    },
    {
        id: "ethereum",
        name: "Ethereum",
        symbol: "ETH",
        price: 3000,
        change24h: -1.2,
        marketCap: 350000000000,
        volume24h: 15000000000,
    },
]

export const revalidate = 60 // Revalidate this page every 60 seconds

export default async function MarketsPage() {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2,
        }).format(value)
    }

    const formatLargeNumber = (value: number) => {
        if (value >= 1_000_000_000_000) {
            return `$${(value / 1_000_000_000_000).toFixed(2)}T`
        }
        if (value >= 1_000_000_000) {
            return `$${(value / 1_000_000_000).toFixed(2)}B`
        }
        if (value >= 1_000_000) {
            return `$${(value / 1_000_000).toFixed(2)}M`
        }
        return formatCurrency(value)
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold mb-8">Cryptocurrency Markets</h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">24h Change</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Market Cap</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Volume (24h)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                {cryptoCurrencies.map((crypto) => (
                                    <tr key={crypto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link href={`/crypto/${crypto.id}`} className="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
                                                <span className="font-medium">{crypto.name}</span>
                                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{crypto.symbol}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                            {formatCurrency(crypto.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className={crypto.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                                                {crypto.change24h >= 0 ? "+" : ""}{crypto.change24h.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {formatLargeNumber(crypto.marketCap)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {formatLargeNumber(crypto.volume24h)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
} 