import React, { useState } from 'react'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('token', res.data.token)
      nav('/dashboard')
    } catch (error) {
      setErr(error?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="container">
      <h1>Register</h1>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      {err && <p style={{color:'crimson'}}>{err}</p>}
      <p style={{marginTop:12}}>Already have an account? <Link className="link" to="/login">Login</Link></p>
    </div>
  )
}
