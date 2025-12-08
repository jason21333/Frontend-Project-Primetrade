'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingEntity, setEditingEntity] = useState(null)
  const [formData, setFormData] = useState({ name: '', owner: '', status: 'Pending' })
  
  // Vanta refs
  const backgroundRef = useRef(null)
  const vantaRef = useRef(null)
  const scriptsLoaded = useRef(false)

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

  // ✅ CDN Vanta Waves FULL BACKGROUND (SSR-safe, no npm needed)
  useEffect(() => {
    if (typeof window === 'undefined' || !backgroundRef.current || scriptsLoaded.current) return

    const initVantaCDN = async () => {
      try {
        console.log('🔄 Initializing CDN Vanta background...')
        
        // Load Three.js r121 (from your attachment)
        if (!window.THREE) {
          const threeScript = document.createElement('script')
          threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js'
          threeScript.async = true
          document.head.appendChild(threeScript)
          await new Promise(resolve => threeScript.onload = () => {
            console.log('✅ Three.js loaded')
            resolve()
          })
        }

        // Load Vanta Waves
        if (!window.VANTA?.WAVES) {
          const vantaScript = document.createElement('script')
          vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js'
          vantaScript.async = true
          document.head.appendChild(vantaScript)
          await new Promise(resolve => vantaScript.onload = () => {
            console.log('✅ Vanta Waves loaded')
            resolve()
          })
        }

        // Wait for everything to be ready
        await new Promise(resolve => setTimeout(resolve, 200))

        // Destroy existing instance first
        if (vantaRef.current) {
          vantaRef.current.destroy()
          console.log('🧹 Destroyed previous Vanta instance')
        }
        
        // ✅ Initialize FULL SCREEN Vanta Waves
        if (window.VANTA && window.THREE && backgroundRef.current) {
          vantaRef.current = window.VANTA.WAVES({
            el: backgroundRef.current,
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 1.00,      // Full viewport height
            minWidth: 1.00,       // Full viewport width
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x1b481f,      // Green waves
            backgroundColor: 0x000000, // Black background
            shininess: 30.00,
            waveSpeed: 0.65,
            waveHeight: 10.00
          })
          
          scriptsLoaded.current = true
          console.log('🎉 Vanta Waves FULL BACKGROUND ACTIVE!')
        }
      } catch (error) {
        console.error('❌ CDN Vanta failed:', error)
      }
    }

    const timeoutId = setTimeout(initVantaCDN, 300)
    return () => {
      clearTimeout(timeoutId)
      if (vantaRef.current) {
        vantaRef.current.destroy()
        vantaRef.current = null
        scriptsLoaded.current = false
      }
    }
  }, [])

  // Fetch user and entities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, entitiesRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/entities')
        ])
        setUser(userRes.data.user)
        setEntities(entitiesRes.data.entities || [])
        setLoading(false)
      } catch (error) {
        setErr(error?.response?.data?.message || 'Failed to load dashboard')
        if (error?.response?.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
        }
        setLoading(false)
      }
    }
    fetchData()
  }, [router])

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (statusFilter !== 'All') params.append('status', statusFilter)
        const res = await api.get(`/entities?${params.toString()}`)
        setEntities(res.data.entities || [])
      } catch (error) {
        console.error('Failed to fetch entities:', error)
      }
    }
    if (user) fetchEntities()
  }, [searchTerm, statusFilter, user])

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const openCreateModal = () => {
    setEditingEntity(null)
    setFormData({ name: '', owner: '', status: 'Pending' })
    setShowModal(true)
  }

  const openEditModal = (entity) => {
    setEditingEntity(entity)
    setFormData({ name: entity.name, owner: entity.owner, status: entity.status })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEntity(null)
    setFormData({ name: '', owner: '', status: 'Pending' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEntity) {
        await api.put(`/entities/${editingEntity._id}`, formData)
      } else {
        await api.post('/entities', formData)
      }
      closeModal()
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'All') params.append('status', statusFilter)
      const res = await api.get(`/entities?${params.toString()}`)
      setEntities(res.data.entities || [])
    } catch (error) {
      setErr(error?.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entity?')) return
    try {
      await api.delete(`/entities/${id}`)
      setEntities(entities.filter(e => e._id !== id))
    } catch (error) {
      setErr(error?.response?.data?.message || 'Delete failed')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      Active: 'bg-green-900/50 text-green-300 border-green-500/30',
      Pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30',
      Inactive: 'bg-red-900/50 text-red-300 border-red-500/30',
    }
    return styles[status] || styles.Pending
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {/* 🌊 Vanta Waves FULL BACKGROUND CONTAINER */}
      <div 
        ref={backgroundRef}
        className="fixed inset-0 z-0 pointer-events-none"
        id="vanta-background"
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed'
        }}
      />
      
      {/* Glassmorphism Content Layer */}
      <div className="relative z-10 flex min-h-screen bg-black/75 backdrop-blur-sm text-white">
        <main className="flex-1 p-6 max-w-7xl mx-auto">
          
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <nav className="flex items-center gap-2 p-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-center p-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl size-10 shadow-lg">
                <span className="material-symbols-outlined text-black text-lg font-bold" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
                  data_usage
                </span>
              </div>
              <a className="px-4 py-2 text-sm font-semibold rounded-xl text-white/90 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all" href="#">
                Dashboard
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-white/70 backdrop-blur-sm px-3 py-2 bg-black/50 rounded-xl">
                <span>{currentTime}</span>
                <span className="material-symbols-outlined text-xs">schedule</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div 
                  className="bg-gradient-to-br from-blue-500 to-purple-600 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 ring-2 ring-white/30 shadow-xl" 
                  style={{
                    backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || '')}&background=135bec&color=fff&size=128")`
                  }}
                />
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 p-3 rounded-2xl text-white/80 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 shadow-xl border border-white/10"
                aria-label="Logout"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          </header>

          {/* User Profile Card */}
          <div className="p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl mb-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-green-400">person</span>
              User Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-white/60">Name</p>
                <p className="text-xl font-bold text-white">{user?.name || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white/60">Email</p>
                <p className="text-xl font-bold text-white break-all">{user?.email || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white/60">User ID</p>
                <p className="text-xs font-mono text-green-400 bg-green-900/30 px-3 py-1 rounded-xl">{user?._id?.slice(-8).toUpperCase() || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-white/60">Member Since</p>
                <p className="text-lg font-bold text-white">{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl col-span-1 lg:col-span-2 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl text-green-400">show_chart</span>
                  Total Energy Consumption
                </h2>
              </div>
              <div className="h-80 bg-gradient-to-br from-green-900/40 via-blue-900/30 to-purple-900/40 rounded-2xl flex items-center justify-center border-2 border-green-400/30 shadow-2xl">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-green-400 mb-4 animate-pulse">trending_up</span>
                  <p className="text-2xl font-bold text-white/80">Dynamic Chart</p>
                  <p className="text-lg text-green-400 mt-2">Loading analytics...</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Green Connections
                </h2>
                <button className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>
              </div>
              <div className="h-64 bg-gradient-to-r from-emerald-900/50 to-teal-900/50 rounded-2xl flex items-center justify-center border-2 border-emerald-400/40 shadow-xl">
                <span className="material-symbols-outlined text-6xl text-emerald-400 animate-spin-slow">hub</span>
              </div>
            </div>
          </div>

          {/* Manage Entities */}
          <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/10">
              <div className="flex flex-wrap justify-between items-center gap-6">
                <div>
                  <h1 className="text-4xl font-black text-white drop-shadow-2xl flex items-center gap-4">
                    <span className="material-symbols-outlined text-5xl text-green-400">inventory_2</span>
                    Manage Entities
                  </h1>
                  <p className="text-xl text-white/60 mt-2">{entities.length} entities</p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative w-72">
                    <input 
                      className="w-full h-14 pl-12 pr-12 text-lg bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:outline-none placeholder:text-white/50 text-white shadow-xl transition-all"
                      placeholder="Search entities..." 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-green-400 text-xl">search</span>
                  </div>
                  <select 
                    className="h-14 px-6 text-lg bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl text-white/90 hover:bg-white/10 pr-10 cursor-pointer shadow-xl transition-all"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Inactive</option>
                  </select>
                  <button 
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-3 h-14 px-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-black rounded-2xl hover:from-green-500 hover:to-emerald-500 shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-200"
                  >
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'wght' 600" }}>add</span>
                    Add New
                  </button>
                </div>
              </div>
            </div>

            {err && (
              <div className="p-6 bg-red-900/70 backdrop-blur-sm border border-red-500/40 rounded-2xl mx-8 my-6 text-red-100 text-lg shadow-xl">
                <span className="material-symbols-outlined text-2xl mr-3">error</span>
                {err}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-black/40 backdrop-blur-sm">
                  <tr>
                    <th className="px-8 py-6 text-lg font-black text-white/90">ID</th>
                    <th className="px-8 py-6 text-lg font-black text-white/90">Entity Name</th>
                    <th className="px-8 py-6 text-lg font-black text-white/90">Owner</th>
                    <th className="px-8 py-6 text-lg font-black text-white/90">Status</th>
                    <th className="px-8 py-6 text-lg font-black text-white/90">Date Created</th>
                    <th className="px-8 py-6 text-lg font-black text-white/90 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entities.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-24 text-center text-white/50">
                        <span className="material-symbols-outlined text-8xl text-white/20 mb-6 block">inventory_2</span>
                        <p className="text-2xl font-bold mb-2">No entities found</p>
                        <p>Create your first entity to get started!</p>
                      </td>
                    </tr>
                  ) : (
                    entities.map((entity) => (
                      <tr key={entity._id} className="border-t border-white/10 hover:bg-white/5 transition-all">
                        <td className="px-8 py-6 font-mono text-xl text-green-400 font-bold">{entity._id.slice(-8).toUpperCase()}</td>
                        <td className="px-8 py-6">
                          <div className="font-bold text-2xl text-white">{entity.name}</div>
                        </td>
                        <td className="px-8 py-6 text-xl text-white/90">{entity.owner}</td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-6 py-3 rounded-2xl text-lg font-black border-4 shadow-xl ${getStatusBadge(entity.status)}`}>
                            {entity.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xl text-white/70">{formatDate(entity.createdAt)}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex gap-3 justify-end">
                            <button 
                              onClick={() => openEditModal(entity)}
                              className="p-4 hover:bg-green-500/20 hover:text-green-400 rounded-2xl border border-green-500/30 transition-all shadow-lg hover:shadow-xl hover:scale-105" 
                              aria-label="Edit"
                            >
                              <span className="material-symbols-outlined text-2xl">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(entity._id)}
                              className="p-4 hover:bg-red-500/20 hover:text-red-400 rounded-2xl border border-red-500/30 transition-all shadow-lg hover:shadow-xl hover:scale-105" 
                              aria-label="Delete"
                            >
                              <span className="material-symbols-outlined text-2xl">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-6">
            <div className="bg-black/80 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white drop-shadow-2xl">
                  {editingEntity ? 'Edit Entity' : 'Create New Entity'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-4 hover:bg-white/10 rounded-2xl transition-all hover:scale-110"
                >
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-xl font-bold text-white mb-4">Entity Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full h-16 px-6 text-xl bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-green-500/40 focus:outline-none text-white shadow-xl transition-all" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-white mb-4">Owner</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full h-16 px-6 text-xl bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-green-500/40 focus:outline-none text-white shadow-xl transition-all" 
                    value={formData.owner} 
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-white mb-4">Status</label>
                  <select 
                    className="w-full h-16 px-6 text-xl bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-green-500/40 focus:outline-none text-white shadow-xl transition-all" 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-6 pt-4">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 h-16 px-8 rounded-2xl border-2 border-white/30 text-xl font-bold text-white/80 hover:border-white/50 hover:bg-white/10 backdrop-blur-xl transition-all shadow-xl hover:shadow-2xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 h-16 px-8 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-xl font-black text-white hover:from-green-500 hover:to-emerald-500 shadow-2xl hover:shadow-3xl transition-all hover:scale-[1.02]"
                  >
                    {editingEntity ? 'Update Entity' : 'Create Entity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
