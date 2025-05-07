"use client"

import { supportedCryptos } from "../config/supported-cryptos"
import FeaturedCryptos from "../components/FeaturedCryptos"
import CryptoTable from "../components/CryptoTable"
import RoleBasedRoute from "@/components/auth/RoleBasedRoute"

export default function Home() {
  // Get the featured cryptocurrencies (BTC, XRP, ETH)
  const featuredCryptos = supportedCryptos.filter(crypto =>
    ["bitcoin", "xrp", "ethereum"].includes(crypto.id)
  )

  return (
    <RoleBasedRoute allowedRoles={['user']} fallbackPath="/login">
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <main className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-center">Crypto Trading Platform</h1>
          {/* Featured cryptocurrencies */}
          <FeaturedCryptos featuredCryptos={featuredCryptos} />
          {/* Crypto market table */}
          <CryptoTable cryptoList={supportedCryptos} />
        </main>
      </div>
    </RoleBasedRoute>
  )
}
