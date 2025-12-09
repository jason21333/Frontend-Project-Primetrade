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

  const containerRef = useRef(null)
  const vantaRef = useRef(null)

  // Time
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

  // Vanta Waves
  useEffect(() => {
    let threeScript = null
    let vantaScript = null
    let timeoutId = null

    const loadThree = () =>
      new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.THREE) return resolve()
        threeScript = document.createElement('script')
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
        threeScript.async = true
        threeScript.onload = () => resolve()
        document.body.appendChild(threeScript)
      })

    const loadVanta = () =>
      new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.VANTA && window.VANTA.WAVES) return resolve()
        vantaScript = document.createElement('script')
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js'
        vantaScript.async = true
        vantaScript.onload = () => resolve()
        document.body.appendChild(vantaScript)
      })

    const initVanta = () => {
      if (!containerRef.current || !window.VANTA || !window.VANTA.WAVES) return
      if (vantaRef.current) {
        try { vantaRef.current.destroy() } catch (e) {}
        vantaRef.current = null
      }
      vantaRef.current = window.VANTA.WAVES({
        el: '#vanta-bg',
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x272f27,
        backgroundColor: 0x000000,
      })
    }

    loadThree()
      .then(loadVanta)
      .then(() => {
        initVanta()
        timeoutId = setTimeout(initVanta, 500)
      })
      .catch(() => {})

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (vantaRef.current && typeof vantaRef.current.destroy === 'function') {
        vantaRef.current.destroy()
        vantaRef.current = null
      }
      if (threeScript && threeScript.parentNode) threeScript.parentNode.removeChild(threeScript)
      if (vantaScript && vantaScript.parentNode) vantaScript.parentNode.removeChild(vantaScript)
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
    <div
      ref={containerRef}
      id="vanta-bg"
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-[#0b1a0b] via-[#060b06] to-black"
    >
      <div className="relative flex h-full grow flex-col">
        <div className="flex flex-1 items-stretch justify-center p-4 sm:p-6 md:p-8">
          <main className="flex-1 max-w-6xl mx-auto text-white">
            {/* Header with Button Navigation */}
            <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <nav className="flex items-center gap-2">
                {/* Dashboard Button */}
                <button className="flex items-center justify-center p-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg hover:bg-white/5 hover:border-green-400/50 hover:scale-105 transition-all">
                  <div className="flex items-center justify-center p-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl w-10 h-10 shadow-md">
                    <span className="material-symbols-outlined text-black text-lg font-bold">
                      dashboard
                    </span>
                  </div>
                </button>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 ml-2">
                  <button className="p-2 text-white/70 hover:text-green-400 hover:bg-white/10 rounded-xl transition-all hover:scale-110" aria-label="Analytics">
                    <span className="material-symbols-outlined text-lg">analytics</span>
                  </button>
                  <button className="p-2 text-white/70 hover:text-blue-400 hover:bg-white/10 rounded-xl transition-all hover:scale-110" aria-label="Settings">
                    <span className="material-symbols-outlined text-lg">settings</span>
                  </button>
                </div>
              </nav>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs text-white/70 backdrop-blur-sm px-2 py-1 bg-black/50 rounded-lg">
                  <span>{currentTime}</span>
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                </div>
                <div className="flex items-center gap-2 p-1">
                  <div 
                    className="bg-gradient-to-br from-blue-500 to-purple-600 bg-center bg-no-repeat bg-cover rounded-full w-9 h-9 ring-2 ring-white/30 shadow-md" 
                    style={{
                      backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || '')}&background=135bec&color=fff&size=128")`
                    }}
                  />
                </div>
                {/* UPDATED: PNG logout icon */}
                <button 
                  onClick={logout}
                  className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-110 shadow-md border border-white/10"
                  aria-label="Logout"
                >
                  <span className="material-symbols-outlined text-lg text-white">logout</span>
                </button>
              </div>
            </header>

            {/* User Profile Card */}
            <div className="p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-green-400">person</span>
                  Profile
                </h2>
                <button className="p-2 hover:bg-white/10 rounded-xl transition-all" aria-label="Edit profile">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    Name
                  </p>
                  <p className="font-semibold text-white">{user?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">email</span>
                    Email
                  </p>
                  <p className="font-semibold text-white break-all">{user?.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">key</span>
                    User ID
                  </p>
                  <p className="text-[11px] font-mono text-green-300 bg-green-900/30 px-2 py-1 rounded-lg">
                    {user?._id?.slice(-8).toUpperCase() || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-white/60 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    Since
                  </p>
                  <p className="font-semibold text-white text-sm">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Manage Entities */}
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-green-400">inventory_2</span>
                      Entities
                    </h1>
                    <p className="text-sm text-white/60 mt-1">{entities.length} total</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative group w-64">
                      <input 
                        id="entity-search"
                        name="entitySearch"
                        className="w-full h-10 pl-10 pr-8 text-sm bg-black/50 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:outline-none placeholder:text-white/50 text-white shadow-md transition-all group-hover:border-green-400/50"
                        placeholder="Search entities..." 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-200 group-hover:scale-110"
                        aria-label="Search"
                      >
                        <span className="material-symbols-outlined text-base">search</span>
                      </button>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                          aria-label="Clear search"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      )}
                    </div>

                    {/* Filter Button */}
                    <button
                      type="button"
                      onClick={() => document.getElementById('status-filter').focus()}
                      className="flex items-center gap-2 h-10 px-4 bg-black/50 backdrop-blur-xl border border-white/20 rounded-xl text-white/90 hover:bg-white/10 hover:border-green-400/50 shadow-md transition-all hover:scale-[1.02]"
                    >
                      <span className="material-symbols-outlined text-base">filter_list</span>
                      <span className="text-xs font-medium capitalize">
                        {statusFilter === 'All' ? 'All' : statusFilter}
                      </span>
                    </button>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={openCreateModal}
                        className="flex items-center justify-center w-11 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all rounded-xl border border-green-500/50"
                        aria-label="Add new entity"
                      >
                        <span className="material-symbols-outlined text-lg font-bold">add</span>
                      </button>
                      <button 
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center w-11 h-11 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white backdrop-blur-xl rounded-xl border border-white/20 shadow-md hover:shadow-lg transition-all hover:rotate-180"
                        aria-label="Refresh data"
                      >
                        <span className="material-symbols-outlined text-lg font-bold">refresh</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {err && (
                <div className="px-6 py-4 bg-red-900/70 backdrop-blur-sm border border-red-500/40 mx-4 my-4 rounded-xl text-sm text-red-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {err}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/40 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-white/90 w-20">ID</th>
                      <th className="px-6 py-3 font-semibold text-white/90">Name</th>
                      <th className="px-6 py-3 font-semibold text-white/90">Owner</th>
                      <th className="px-6 py-3 font-semibold text-white/90 w-24">Status</th>
                      <th className="px-6 py-3 font-semibold text-white/90 w-32">Created</th>
                      <th className="px-6 py-3 font-semibold text-white/90 text-right w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entities.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-16 text-center text-white/50">
                          <span className="material-symbols-outlined text-5xl text-white/20 mb-3 block">
                            inventory_2
                          </span>
                          <p className="text-base font-semibold mb-1">No entities</p>
                          <button 
                            onClick={openCreateModal}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                          >
                            <span className="material-symbols-outlined">add</span>
                            Create first
                          </button>
                        </td>
                      </tr>
                    ) : (
                      entities.map((entity) => (
                        <tr key={entity._id} className="border-t border-white/10 hover:bg-white/5 transition-all">
                          <td className="px-6 py-3 font-mono text-xs text-green-400 font-semibold">
                            {entity._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-6 py-3">
                            <div className="font-semibold text-sm text-white flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-white/50">label</span>
                              {entity.name}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-sm text-white/90 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-white/50">person</span>
                            {entity.owner}
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold border ${getStatusBadge(entity.status)}`}>
                              <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
                              {entity.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-xs text-white/70 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-white/40">calendar_today</span>
                            {formatDate(entity.createdAt)}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <button 
                                onClick={() => openEditModal(entity)}
                                className="flex items-center justify-center w-9 h-9 hover:bg-green-500/20 hover:text-green-400 rounded-xl border border-green-500/30 transition-all hover:scale-105 shadow-md text-sm" 
                                aria-label="Edit entity"
                              >
                                <span className="material-symbols-outlined text-lg font-bold">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(entity._id)}
                                className="flex items-center justify-center w-9 h-9 hover:bg-red-500/20 hover:text-red-400 rounded-xl border border-red-500/30 transition-all hover:scale-105 shadow-md text-sm" 
                                aria-label="Delete entity"
                              >
                                <span className="material-symbols-outlined text-lg font-bold">delete</span>
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-black/80 backdrop-blur-3xl border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto text-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-green-400">
                  {editingEntity ? 'edit' : 'add'}
                </span>
                {editingEntity ? 'Edit Entity' : 'New Entity'}
              </h2>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                  <span className="material-symbols-outlined text-sm">label</span>
                  Name
                </label>
                <input 
                  id="entity-name"
                  name="entityName"
                  type="text" 
                  required 
                  className="w-full h-10 pl-9 text-sm bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-green-500/40 focus:outline-none text-white shadow-md transition-all" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Owner
                </label>
                <input 
                  id="entity-owner"
                  name="entityOwner"
                  type="text" 
                  required 
                  className="w-full h-10 pl-9 text-sm bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-green-500/40 focus:outline-none text-white shadow-md transition-all" 
                  value={formData.owner} 
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })} 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                  <span className="material-symbols-outlined text-sm">toggle_on</span>
                  Status
                </label>
                <select 
                  id="entity-status"
                  name="entityStatus"
                  className="w-full h-10 pl-9 text-sm bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl focus:ring-2 focus:ring-green-500/40 focus:outline-none text-white shadow-md transition-all" 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex items-center justify-center gap-2 flex-1 h-11 rounded-xl border border-white/30 text-xs font-semibold text-white/80 hover:border-white/50 hover:bg白/10 backdrop-blur-xl transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 flex-1 h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-xs font-bold text-white hover:from-green-500 hover:to-emerald-500 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-base font-bold">
                    {editingEntity ? 'save' : 'add'}
                  </span>
                  {editingEntity ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
