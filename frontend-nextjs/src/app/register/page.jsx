'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const containerRef = useRef(null)
  const vantaRef = useRef(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    let threeScript = null
    let vantaScript = null

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
        if (typeof window !== 'undefined' && window.VANTA && window.VANTA.DOTS) return resolve()
        vantaScript = document.createElement('script')
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js'
        vantaScript.async = true
        vantaScript.onload = () => resolve()
        document.body.appendChild(vantaScript)
      })

    const initVanta = () => {
      if (!containerRef.current || !window.VANTA || !window.VANTA.DOTS) return
      if (vantaRef.current) {
        try { vantaRef.current.destroy() } catch (e) {}
        vantaRef.current = null
      }
      vantaRef.current = window.VANTA.DOTS({
        el: containerRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xff7900,
        color2: 0xff7900,
        backgroundColor: 0x000000,  // ✅ PURE BLACK
        size: 3.5,
        spacing: 35.0,
      })
    }

    loadThree()
      .then(loadVanta)
      .then(initVanta)
      .catch(() => {})

    return () => {
      if (vantaRef.current && typeof vantaRef.current.destroy === 'function') {
        vantaRef.current.destroy()
        vantaRef.current = null
      }
      if (threeScript && threeScript.parentNode) threeScript.parentNode.removeChild(threeScript)
      if (vantaScript && vantaScript.parentNode) vantaScript.parentNode.removeChild(vantaScript)
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('token', res.data.token)
      router.push('/dashboard')
    } catch (error) {
      setErr(error?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div ref={containerRef} id="vanta-bg" className="relative flex min-h-screen w-full flex-col bg-black overflow-x-hidden">  {/* ✅ PURE BLACK */}
      <div className="relative flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="glassmorphism-card register-card w-full max-w-md h-auto p-6 sm:p-8 bg-black/30">  {/* ✅ BLACK GLASS */}
            <div className="card-content">
              <div className="flex items-center justify-center gap-2 pb-6">
                <span className="material-symbols-outlined text-primary text-4xl">CRYPTO</span>
                <h2 className="text-2xl font-bold tracking-tighter text-white">EnterpriseHub</h2>
              </div>

              <h1 className="text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2">Create Account</h1>
              <p className="text-gray-300 text-base font-semibold leading-normal pb-6 text-center">Sign up to get access to your dashboard.</p>

              <form onSubmit={submit} className="flex w-full flex-col gap-4 px-0 py-3">
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-semibold leading-normal pb-2">Name</p>
                  <div className="relative flex w-full items-center">
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/10 focus:border-primary h-12 placeholder:text-gray-400 pl-4 pr-4 py-2 text-base font-semibold leading-normal"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      required
                    />
                  </div>
                </label>

                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-semibold leading-normal pb-2">Email</p>
                  <div className="relative flex w-full items-center">
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/10 focus:border-primary h-12 placeholder:text-gray-400 pl-4 pr-4 py-2 text-base font-semibold leading-normal"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                    />
                  </div>
                </label>

                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-semibold leading-normal pb-2">Password</p>
                  <div className="relative flex w-full items-center">
                   <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/10 focus:border-primary h-12 placeholder:text-gray-400 pl-4 pr-4 py-2 text-base font-semibold leading-normal"
                      placeholder="Create a password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </label>

                <div className="flex flex-col items-stretch px-0 pt-4 pb-3">
                  <button type="submit" className="glass-button">
                    Create Account
                  </button>
                </div>
              </form>

              {err && <p className="text-sm text-red-400 text-center">{err}</p>}

              <p className="text-center text-sm text-gray-400 mt-4">Already have an account? <Link className="text-primary font-semibold hover:underline" href="/login">Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
