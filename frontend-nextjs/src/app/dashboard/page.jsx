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

  // ✅ FIXED Vanta Waves - Works 100% with Next.js 15+
  useEffect(() => {
    if (typeof window === 'undefined' || !backgroundRef.current || scriptsLoaded.current) return

    let vantaEffect;

    const initVanta = async () => {
      try {
        console.log('🔄 Initializing Vanta background...')
        
        // Clean up first
        if (vantaEffect) {
          vantaEffect.destroy();
        }

        // Load scripts only once
        if (!window.THREE) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = () => {
              console.log('✅ Three.js r128 loaded');
              resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!window.VANTA?.WAVES) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/vanta@1.7.2/dist/vanta.waves.min.js?v=20231208';
            script.onload = () => {
              console.log('✅ Vanta Waves loaded');
              resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Small delay for DOM readiness
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize Vanta
        if (window.VANTA?.WAVES && window.THREE && backgroundRef.current) {
          vantaEffect = window.VANTA.WAVES({
            el: backgroundRef.current,
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 1.0,
            minWidth: 1.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x10ff00,        // Bright green waves
            backgroundColor: 0x0a0a0a, // Dark black
            shininess: 50,
            waveSpeed: 0.75,
            waveHeight: 15,
            zoom: 0.65
          });
          
          vantaRef.current = vantaEffect;
          scriptsLoaded.current = true;
          console.log('🎉 Vanta background ACTIVE!');
        }
      } catch (error) {
        console.error('❌ Vanta init failed:', error);
      }
    };

    // Initialize after short delay
    const timeout = setTimeout(initVanta, 500);

    return () => {
      clearTimeout(timeout);
      if (vantaEffect) {
        vantaEffect.destroy();
        vantaEffect = null;
      }
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
      scriptsLoaded.current = false;
    };
  }, []);

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
      {/* 🌊 Vanta Waves FULL BACKGROUND - FIXED */}
      <div 
        ref={backgroundRef}
        className="fixed inset-0 z-0 pointer-events-none"
        id="vanta-bg"
        style={{ 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0
        }}
      />
      
      {/* Debug info - REMOVE IN PRODUCTION */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50 bg-red-500/90 text-white p-2 rounded text-sm">
          Vanta Ref: {backgroundRef.current ? '✅' : '❌'} | Scripts: {scriptsLoaded.current ? '✅' : '❌'}
        </div>
      )}
      
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
                  <p className="text-2xl font-bold text-white/80">chart</p>
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

          {/* Manage Entities - ICON BUTTONS */}
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
                  {/* 🔍 Search Icon Button */}
                  <div className="relative group w-72">
                    <input 
                      className="w-full h-14 pl-14 pr-4 text-lg bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl focus:ring-4 focus:ring-green-500/30 focus:outline-none placeholder:text-white/50 text-white shadow-xl transition-all group-hover:border-green-400/50"
                      placeholder="Search entities..." 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-200 group-hover:scale-110 shadow-lg hover:shadow-xl"
                      aria-label="Search"
                    >
                      <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">search</span>
                    </button>
                    
                    {/* Clear Search Button */}
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                        aria-label="Clear search"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    )}
                  </div>

                  {/* ⏳ Filter Icon Button */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => document.getElementById('status-filter').focus()}
                      className="flex items-center gap-3 h-14 px-6 bg-black/50 backdrop-blur-xl border border-white/20 rounded-2xl text-white/90 hover:bg-white/10 hover:border-green-400/50 hover:scale-[1.02] shadow-xl transition-all duration-200 pr-10"
                    >
                      <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">filter_list</span>
                      <span className="font-semibold capitalize">{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
                      <span className="material-symbols-outlined text-lg ml-auto text-white/60 group-hover:text-white/80 transition-all">arrow_drop_down</span>
                    </button>
                    
                    <select 
                      id="status-filter"
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Pending</option>
                      <option>Inactive</option>
                    </select>
                  </div>

                  {/* ➕ Add New Icon Button */}
                  <button 
                    onClick={openCreateModal}
                    className="flex items-center justify-center size-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-2xl hover:shadow-3xl hover:scale-[1.05] transition-all duration-200 rounded-3xl border-2 border-green-500/50 backdrop-blur-xl"
                    aria-label="Add new entity"
                  >
                    <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'wght' 700" }}>add</span>
                  </button>

                  {/* 🔄 Refresh Button */}
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center size-14 p-3 bg-white/10 hover:bg-white/20 hover:scale-110 text-white/80 hover:text-white backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-200"
                    aria-label="Refresh data"
                  >
                    <span className="material-symbols-outlined text-xl rotate-0 hover:rotate-180 transition-transform duration-500">refresh</span>
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
