import Link from "next/link"

export default function Header() {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        CryptoTrader
                    </Link>

                    <nav className="space-x-6">
                        <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Dashboard
                        </Link>
                        <Link href="/markets" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            Markets
                        </Link>
                        <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                            About
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
} 