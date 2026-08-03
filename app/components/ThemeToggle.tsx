'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const saved = localStorage.getItem('theme')

    if (saved === 'dark' || (!saved && prefersDark)) {
      setIsDark(true)
      document.documentElement.style.colorScheme = 'dark'
    } else {
      setIsDark(false)
      document.documentElement.style.colorScheme = 'light'
    }
  }, [])

  function toggleTheme() {
    const newDark = !isDark
    setIsDark(newDark)

    if (newDark) {
      document.documentElement.style.colorScheme = 'dark'
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.style.colorScheme = 'light'
      localStorage.setItem('theme', 'light')
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 1000,
        background: 'var(--warm-brown)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        transition: 'opacity 0.2s',
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = '1'
      }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
