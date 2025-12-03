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

  // Sample entities data - replace with API call later
  const entities = [
    { id: 'ENT-001', name: 'Project Alpha', owner: 'Cameron Williamson', status: 'Active', date: '2023-10-26' },
    { id: 'ENT-002', name: 'Initiative Beta', owner: 'Robert Fox', status: 'Pending', date: '2023-10-25' },
    { id: 'ENT-003', name: 'Taskforce Gamma', owner: 'Esther Howard', status: 'Active', date: '2023-10-24' },
    { id: 'ENT-004', name: 'Operation Delta', owner: 'Kristin Watson', status: 'Inactive', date: '2023-10-22' },
  ]

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-green-900/50 text-green-300 border-green-500/30',
      Pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30',
      Inactive: 'bg-red-900/50 text-red-300 border-red-500/30',
    }
    return styles[status] || styles.Inactive
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
              <a className="px-3 py-1.5 text-sm font-medium rounded-full text-on-surface-dark hover:bg-white/10 transition-colors" href="#">
                My apartments
              </a>
              <a className="px-3 py-1.5 text-sm font-medium rounded-full text-on-surface-dark hover:bg-white/10 transition-colors" href="#">
                Reporting
              </a>
              <a className="px-3 py-1.5 text-sm font-medium rounded-full text-on-surface-dark hover:bg-white/10 transition-colors" href="#">
                Settings
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="p-6 bg-surface-dark border border-border-dark rounded-xl col-span-1 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-on-surface-dark">Total energy consumption</h2>
                <button className="px-3 py-1 text-xs font-medium border rounded-full border-border-dark text-on-surface-secondary-dark hover:bg-white/10">
                  Change module
                </button>
              </div>
              <div className="h-48 bg-gray-800/50 rounded-lg flex items-center justify-center">
                <p className="text-on-surface-secondary-dark">Chart Placeholder</p>
              </div>
            </div>

            <div className="p-6 bg-surface-dark border border-border-dark rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-on-surface-dark">Green connections</h2>
                <button className="text-on-surface-secondary-dark hover:text-white">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <div className="h-48 bg-gray-800/50 rounded-lg flex items-center justify-center">
                <p className="text-on-surface-secondary-dark">Visualization Placeholder</p>
              </div>
            </div>
          </div>

          {/* Manage Entities Section */}
          <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h1 className="text-2xl font-bold leading-tight text-on-surface-dark">Manage Entities</h1>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-secondary-dark">
                    search
                  </span>
                  <input 
                    className="w-full h-10 pl-10 pr-4 text-sm bg-surface-dark border rounded-lg border-border-dark focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-on-surface-secondary-dark text-on-surface-dark"
                    placeholder="Search entities..." 
                    type="text"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark border border-border-dark px-4 text-sm font-medium text-on-surface-secondary-dark hover:bg-white/10">
                    Status
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </button>
                  <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark border border-border-dark px-4 text-sm font-medium text-on-surface-secondary-dark hover:bg-white/10">
                    Date Range
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </button>
                </div>
                <button className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'wght' 500" }}>
                    add
                  </span>
                  <span className="truncate">Add New</span>
                </button>
              </div>
            </div>

            {/* Entities Table */}
            <div className="overflow-x-auto bg-surface-dark rounded-xl border border-border-dark">
              <table className="w-full text-sm text-left text-on-surface-secondary-dark">
                <thead className="text-xs uppercase text-on-surface-secondary-dark">
                  <tr>
                    <th className="px-6 py-4 font-medium" scope="col">ID</th>
                    <th className="px-6 py-4 font-medium" scope="col">Entity Name</th>
                    <th className="px-6 py-4 font-medium" scope="col">Owner</th>
                    <th className="px-6 py-4 font-medium" scope="col">Status</th>
                    <th className="px-6 py-4 font-medium" scope="col">Date Created</th>
                    <th className="px-6 py-4 font-medium text-right" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.map((entity) => (
                    <tr key={entity.id} className="border-t border-border-dark hover:bg-white/5">
                      <td className="px-6 py-4 font-medium text-on-surface-dark whitespace-nowrap">{entity.id}</td>
                      <td className="px-6 py-4">{entity.name}</td>
                      <td className="px-6 py-4">{entity.owner}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(entity.status)}`}>
                          {entity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{entity.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-4">
                          <button className="hover:text-primary transition-colors" aria-label="Edit">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button className="hover:text-red-500 transition-colors" aria-label="Delete">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
