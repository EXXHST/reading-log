'use client'

import { useEffect, useState } from 'react'
import styles from './ThemeToggleNav.module.css'

export default function ThemeToggleNav() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const saved = localStorage.getItem('theme')

    if (saved === 'dark' || (!saved && prefersDark)) {
      setIsDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.style.colorScheme = 'dark'
    } else {
      setIsDark(false)
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.style.colorScheme = 'light'
    }
  }, [])

  function toggleTheme() {
    const newDark = !isDark
    setIsDark(newDark)

    if (newDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.style.colorScheme = 'dark'
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.style.colorScheme = 'light'
      localStorage.setItem('theme', 'light')
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <button onClick={toggleTheme} className={styles.themeToggle}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  )
}
