"use client"

import { useParams } from 'next/navigation'
import CryptoDetailClient from './crypto-detail-client'

export default function CryptoDetailPage() {
    // Use Next.js useParams hook to get the route parameters
    const params = useParams()
    const id = params?.id as string

    return <CryptoDetailClient cryptoId={id} />
} 