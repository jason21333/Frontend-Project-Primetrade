'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/dashboard')
        setUser(res.data.user)
      } catch (error) {
        setErr(error?.response?.data?.message || 'Failed to load dashboard')
        localStorage.removeItem('token')
        router.push('/login')
      }
    }
    fetchUser()
  }, [router])

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!user) return <div className="container mx-auto p-6">Loading...</div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="glass-effect p-6 rounded-2xl max-w-2xl w-full">
        <h1 className="text-2xl font-bold">Welcome, {user.name || user.email}</h1>
        <div className="mt-4 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user._id}</p>
        </div>
        <div className="mt-6">
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Logout</button>
        </div>
      </div>
    </div>
  )
}
