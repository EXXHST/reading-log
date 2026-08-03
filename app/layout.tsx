import type { Metadata } from 'next'
import '../styles/globals.css'
import { AuthProvider } from './context/AuthContext'
import LayoutContent from './components/LayoutContent'

export const metadata: Metadata = {
  title: 'Reading Log',
  description: 'Track and explore your reading journey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  )
}
