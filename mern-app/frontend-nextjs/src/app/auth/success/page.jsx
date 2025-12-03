'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Extract token from URL fragment (e.g., #token=xyz)
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const params = new URLSearchParams(hash.substring(1))
    const token = params.get('token')

    if (token) {
      // Store token in localStorage
      localStorage.setItem('token', token)
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      // No token, redirect back to login
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <p className="text-white">Authenticating...</p>
    </div>
  )
}
