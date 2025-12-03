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

  const openOAuth = (provider) => {
    // Opens OAuth flow in a new window/tab. Backend routes should handle provider redirects.
    // If you prefer same-tab navigation, replace window.open with (window.location.href = ...)
    const url = `/auth/oauth/${provider}`
    try {
      window.open(url, '_self')
    } catch (e) {
      // fallback
      window.location.href = url
    }
  }

  return (
    <div ref={containerRef} id="vanta-bg" className="relative flex min-h-screen w-full flex-col bg-slate-950 dark:bg-slate-950 overflow-x-hidden">
      <div className="relative flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="glassmorphism-card w-full max-w-md h-auto p-6 sm:p-8">
            <div className="card-content">
              <div className="flex items-center justify-center gap-2 pb-6">
                <span className="material-symbols-outlined text-primary text-4xl">hexagon</span>
                <h2 className="text-2xl font-bold tracking-tighter text-white">AETHER</h2>
              </div>

              <h1 className="text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2">Welcome Back</h1>
              <p className="text-gray-300 text-base font-semibold leading-normal pb-6 text-center">Log in to continue to your account.</p>

              <form onSubmit={submit} className="flex w-full flex-col gap-4 px-0 py-3">
                <label className="flex flex-col w-full">
                  <p className="text-white text-sm font-semibold leading-normal pb-2">Email</p>
                  <div className="relative flex w-full items-center">
                    <span className="material-symbols-outlined absolute left-3 text-gray-400">mail</span>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/10 focus:border-primary h-12 placeholder:text-gray-400 pl-10 pr-4 py-2 text-base font-semibold leading-normal"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                    />
                  </div>
                </label>

                <label className="flex flex-col w-full">
                  <div className="flex justify-between items-baseline pb-2">
                    <p className="text-white text-sm font-semibold leading-normal">Password</p>
                    <a className="text-sm font-semibold text-primary hover:underline" href="#">Forgot Password?</a>
                  </div>
                  <div className="relative flex w-full items-center">
                    <span className="material-symbols-outlined absolute left-3 text-gray-400">lock</span>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-white/20 bg-white/10 focus:border-primary h-12 placeholder:text-gray-400 pl-10 pr-10 py-2 text-base font-semibold leading-normal"
                      placeholder="Enter your password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="absolute right-3 text-gray-400 hover:text-primary" aria-label="toggle visibility">
                      <span className="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </label>

                <div className="flex flex-col items-stretch px-0 pt-4 pb-3">
                  <button type="submit" className="glass-button">
                    Log In
                  </button>
                </div>
              </form>

              {err && <p className="text-sm text-red-400 text-center">{err}</p>}

              <div className="flex items-center gap-4 px-0 py-4">
                <hr className="flex-1 border-t border-white/20" />
                <p className="text-sm font-semibold text-gray-400">OR CONTINUE WITH</p>
                <hr className="flex-1 border-t border-white/20" />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-4 px-0 pt-3 pb-4">
                <button
                  type="button"
                  onClick={() => openOAuth('google')}
                  aria-label="Sign in with Google"
                  className="flex h-12 flex-1 items-center justify-center gap-2.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <img alt="Google logo" className="h-6 w-6" src="https://www.svgrepo.com/show/355037/google.svg" />
                  <span className="text-base font-semibold text-white">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => openOAuth('github')}
                  aria-label="Sign in with GitHub"
                  className="flex h-12 flex-1 items-center justify-center gap-2.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <img alt="GitHub logo" className="h-6 w-6" src="/github-logo.png" />
                  <span className="text-base font-semibold text-white">GitHub</span>
                </button>
              </div>

              <p className="text-center text-sm text-gray-400">Don't have an account? <Link className="text-primary font-semibold hover:underline" href="/register">Register</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
