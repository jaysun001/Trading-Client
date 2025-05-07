import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import BottomNavigation from "@/components/BottomNavigation"
import AuthProvider from "@/components/auth/AuthProvider"
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crypto Trading Platform",
  description: "A platform for trading cryptocurrencies",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <main className="mb-16">
            {children}
          </main>
          <BottomNavigation />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#166534',
                },
              },
              error: {
                style: {
                  background: '#991b1b',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
