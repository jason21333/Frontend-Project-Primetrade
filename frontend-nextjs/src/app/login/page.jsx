'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const containerRef = useRef(null)
  const vantaRef = useRef(null)
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
      const isDark = document.documentElement.classList.contains('dark')
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
        color2: isDark ? 0xff7900 : 0xff7900,
        backgroundColor: isDark ? 0x101322 : 0xf6f6f8,
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
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      router.push('/dashboard')
    } catch (error) {
      setErr(error?.response?.data?.message || 'Login failed')
    }
  }


  return (
    <div ref={containerRef} id="vanta-bg" className="relative flex min-h-screen w-full flex-col bg-slate-950 dark:bg-slate-950 overflow-x-hidden">
      {/* Developer Credit - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10">
        <a 
          href="https://github.com/jason21333" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
        >
          <span>Shubhankar Datta</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
      </div>

      <div className="relative flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="glassmorphism-card w-full max-w-md h-auto p-6 sm:p-8">
            <div className="card-content">
              <div className="flex items-center justify-center gap-2 pb-6">
                <span className="material-symbols-outlined text-primary text-4xl">hexagon</span>
                <h2 className="text-2xl font-bold tracking-tighter text-white">AETHER</h2>
              </div>

              <h1 className="text-white tracking-tight text-3xl font-bold leading-tight text-center pb-6">Welcome Back</h1>

              <form onSubmit={submit} className="flex w-full flex-col gap-4 px-0 py-3">
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
  <p className="text-white text-sm font-semibold leading-normal pb-2">
    Password
  </p>

  <div className="relative flex w-full items-center">
     <input
      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/10 focus:border-primary h-12 placeholder:text-gray-400 pl-4 pr-10 py-2 text-base font-semibold leading-normal"
      placeholder="Enter your password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
  </div>
</label>
  <div className="flex flex-col items-stretch px-0 pt-4 pb-3">
     <button type="submit" className="glass-button">
      Log In
      </button>
    </div>
    </form>

              {err && <p className="text-sm text-red-400 text-center">{err}</p>}

              <p className="text-center text-sm text-gray-400 mt-4">Don't have an account? <Link className="text-primary font-semibold hover:underline" href="/register">Register</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
