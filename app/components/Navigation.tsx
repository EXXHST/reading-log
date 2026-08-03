'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import ThemeToggleNav from './ThemeToggleNav'
import styles from './Navigation.module.css'

export default function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <h1 className={styles.title}>Reading Log</h1>
        <div className={styles.links}>
          <Link
            href="/"
            className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}
          >
            Dashboard
          </Link>
          <Link
            href="/catalogue"
            className={`${styles.link} ${pathname === '/catalogue' ? styles.active : ''}`}
          >
            Catalogue
          </Link>
          <Link
            href="/statistics"
            className={`${styles.link} ${pathname === '/statistics' ? styles.active : ''}`}
          >
            Statistics
          </Link>
          <Link
            href="/timeline"
            className={`${styles.link} ${pathname === '/timeline' ? styles.active : ''}`}
          >
            Timeline
          </Link>
          <Link
            href="/settings"
            className={`${styles.link} ${pathname === '/settings' ? styles.active : ''}`}
          >
            Settings
          </Link>
        </div>
        <div className={styles.user}>
          <span className={styles.email}>{user?.email}</span>
          <ThemeToggleNav />
          <button onClick={signOut} className={styles.signOut}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}
