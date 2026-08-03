'use client'

import { useAuth } from '../context/AuthContext'
import Navigation from './Navigation'
import LoginPage from '../login/page'

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  )
}
