"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/admin/LoadingSpinner'

export default function ResetPasswordRedirectPage() {
    const router = useRouter()

    useEffect(() => {
        router.push('/admin/users')
    }, [router])

    return <LoadingSpinner />
} 