import React, { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      nav('/dashboard')
    } catch (error) {
      setErr(error?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      {err && <p style={{color:'crimson'}}>{err}</p>}
      <p style={{marginTop:12}}>Don't have an account? <Link className="link" to="/register">Register</Link></p>
    </div>
  )
}
