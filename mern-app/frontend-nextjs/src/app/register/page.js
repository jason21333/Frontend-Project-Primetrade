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
      const res = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('token', res.data.token)
      router.push('/dashboard')
    } catch (error) {
      setErr(error?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div ref={containerRef} id="vanta-bg" className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <div className="relative flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="glass-effect flex flex-col w-full max-w-md rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-center gap-2 pb-6 pt-4">
              <span className="material-symbols-outlined text-primary text-4xl">hexagon</span>
              <h2 className="text-2xl font-bold tracking-tighter text-black dark:text-white">AETHER</h2>
            </div>

            <h1 className="text-black dark:text-white tracking-tight text-3xl font-bold leading-tight text-center pb-2 pt-6">Create Account</h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base font-semibold leading-normal pb-6 text-center">Sign up to get access to your dashboard.</p>

            <form onSubmit={submit} className="flex w-full flex-col gap-4 px-0 py-3">
              <label className="flex flex-col w-full">
                <p className="text-black dark:text-white text-sm font-semibold leading-normal pb-2">Name</p>
                <div className="relative flex w-full items-center">
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-zinc-300/50 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-900/50 focus:border-primary h-12 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pl-4 pr-4 py-2 text-base font-semibold leading-normal"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    required
                  />
                </div>
              </label>

              <label className="flex flex-col w-full">
                <p className="text-black dark:text-white text-sm font-semibold leading-normal pb-2">Email</p>
                <div className="relative flex w-full items-center">
                  <span className="material-symbols-outlined absolute left-3 text-zinc-400 dark:text-zinc-500">mail</span>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-zinc-300/50 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-900/50 focus:border-primary h-12 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pl-10 pr-4 py-2 text-base font-semibold leading-normal"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                  />
                </div>
              </label>

              <label className="flex flex-col w-full">
                <p className="text-black dark:text-white text-sm font-semibold leading-normal pb-2">Password</p>
                <div className="relative flex w-full items-center">
                  <span className="material-symbols-outlined absolute left-3 text-zinc-400 dark:text-zinc-500">lock</span>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-zinc-300/50 dark:border-zinc-700/50 bg-zinc-50/50 dark:bg-zinc-900/50 focus:border-primary h-12 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pl-10 pr-4 py-2 text-base font-semibold leading-normal"
                    placeholder="Create a password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </label>

              <div className="flex flex-col items-stretch px-0 pt-4 pb-3">
                <button type="submit" className="flex items-center justify-center rounded-lg bg-primary h-12 text-white text-base font-semibold leading-normal transition-all hover:bg-primary/90 glow-shadow">
                  Create Account
                </button>
              </div>
            </form>

            {err && <p className="text-sm text-red-500 text-center">{err}</p>}

            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-4">Already have an account? <Link className="text-primary font-semibold" href="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}