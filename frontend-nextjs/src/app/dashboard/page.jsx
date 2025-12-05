'use client'

import { useEffect, useState } from 'react'
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

  // Fetch entities with filters
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
    if (user) {
      fetchEntities()
    }
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
    setFormData({
      name: entity.name,
      owner: entity.owner,
      status: entity.status
    })
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
      // Refresh entities
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
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
                <span className="text-sm">{currentTime}</span>
                <span className="text-sm">Time</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
                  data-alt="User avatar" 
                  style={{
                    backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || '')}&background=135bec&color=fff&size=128")`
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

          {/* User Profile Section */}
          <div className="p-6 bg-surface-dark border border-border-dark rounded-xl mb-6">
            <h2 className="text-lg font-semibold text-on-surface-dark mb-4">User Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-on-surface-secondary-dark mb-1">Name</p>
                <p className="text-on-surface-dark font-medium">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-on-surface-secondary-dark mb-1">Email</p>
                <p className="text-on-surface-dark font-medium">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-on-surface-secondary-dark mb-1">User ID</p>
                <p className="text-on-surface-dark font-medium text-xs">{user?._id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-on-surface-secondary-dark mb-1">Member Since</p>
                <p className="text-on-surface-dark font-medium">
                  {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="p-6 bg-surface-dark border border-border-dark rounded-xl col-span-1 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-on-surface-dark">Total energy consumption</h2>
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
                   <input 
                    className="w-full h-10 pl-4 pr-4 text-sm bg-surface-dark border rounded-lg border-border-dark focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-on-surface-secondary-dark text-on-surface-dark"
                    placeholder="Search entities..." 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <select
                    className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-surface-dark border border-border-dark px-4 text-sm font-medium text-on-surface-secondary-dark hover:bg-white/10 appearance-none pr-8 cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-secondary-dark pointer-events-none text-sm">
                    expand_more
                  </span>
                </div>
                <button 
                  onClick={openCreateModal}
                  className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'wght' 500" }}>
                    add
                  </span>
                  <span className="truncate">Add New</span>
                </button>
              </div>
            </div>

            {err && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {err}
              </div>
            )}

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
                  {entities.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-on-surface-secondary-dark">
                        No entities found
                      </td>
                    </tr>
                  ) : (
                    entities.map((entity) => (
                      <tr key={entity._id} className="border-t border-border-dark hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-on-surface-dark whitespace-nowrap">
                          {entity._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4">{entity.name}</td>
                        <td className="px-6 py-4">{entity.owner}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(entity.status)}`}>
                            {entity.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{formatDate(entity.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-4">
                            <button 
                              onClick={() => openEditModal(entity)}
                              className="hover:text-primary transition-colors" 
                              aria-label="Edit"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(entity._id)}
                              className="hover:text-red-500 transition-colors" 
                              aria-label="Delete"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
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
        </div>
      </main>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-on-surface-dark">
                {editingEntity ? 'Edit Entity' : 'Create New Entity'}
              </h2>
              <button 
                onClick={closeModal}
                className="text-on-surface-secondary-dark hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-dark mb-2">
                  Entity Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-10 px-4 text-sm bg-background-dark border rounded-lg border-border-dark focus:ring-2 focus:ring-primary focus:outline-none text-on-surface-dark"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-dark mb-2">
                  Owner
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-10 px-4 text-sm bg-background-dark border rounded-lg border-border-dark focus:ring-2 focus:ring-primary focus:outline-none text-on-surface-dark"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-dark mb-2">
                  Status
                </label>
                <select
                  className="w-full h-10 px-4 text-sm bg-background-dark border rounded-lg border-border-dark focus:ring-2 focus:ring-primary focus:outline-none text-on-surface-dark"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 h-10 px-4 rounded-lg border border-border-dark text-on-surface-secondary-dark hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 px-4 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
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
