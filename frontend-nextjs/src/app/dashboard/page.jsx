'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [err, setErr] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      setCurrentTime(timeString)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark text-on-surface-dark">
        <div className="text-on-surface-secondary-dark">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background-dark text-on-surface-dark">
      <main className="flex-1 p-6">
        <div className="w-full">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <nav className="flex items-center gap-2 p-1.5 bg-surface-dark border border-border-dark rounded-full">
              <a className="flex items-center justify-center p-2 bg-white rounded-full size-8" href="#">
                <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
                  data_usage
                </span>
              </a>
              <a className="px-3 py-1.5 text-sm font-medium rounded-full text-on-surface-dark hover:bg-white/10 transition-colors" href="#">
                Dashboard
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-on-surface-secondary-dark">
                <span className="text-sm">{currentTime || '11:37 AM'}</span>
                <span className="text-sm">Time</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
                  data-alt="User avatar" 
                  style={{
                    backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=135bec&color=fff&size=128")`
                  }}
                />
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 p-2 rounded-full text-on-surface-secondary-dark hover:bg-surface-dark transition-colors"
                aria-label="Logout"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </header>

          {/* Welcome Section */}
          <div className="p-6 bg-surface-dark border border-border-dark rounded-xl">
            <h1 className="text-2xl font-bold leading-tight text-on-surface-dark mb-4">Welcome, {user.name || user.email}</h1>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-on-surface-secondary-dark mb-2"><strong className="text-on-surface-dark">Email:</strong> {user.email}</p>
              <p className="text-on-surface-secondary-dark"><strong className="text-on-surface-dark">User ID:</strong> {user._id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
