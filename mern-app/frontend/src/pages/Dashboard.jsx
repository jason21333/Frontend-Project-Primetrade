import React, { useEffect, useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [message, setMessage] = useState('Loading...')
  const nav = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await api.get('/dashboard', { headers: { Authorization: `Bearer ${token}` } })
        setMessage(res.data.message + ' — userId: ' + res.data.userId)
      } catch (err) {
        console.error(err)
        localStorage.removeItem('token')
        nav('/login')
      }
    }
    fetch()
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    nav('/login')
  }

  return (
    <div className="container dashboard">
      <h1>Dashboard</h1>
      <p>{message}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
