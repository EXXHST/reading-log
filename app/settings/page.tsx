'use client'

import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { importBooksFromCSV } from '@/lib/csvImport'
import styles from './settings.module.css'

export default function Settings() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setResult(null)

    try {
      const importResult = await importBooksFromCSV(file)
      setResult(importResult)
    } catch (error) {
      setResult({
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={styles.container}>
      <h1>Settings & Import</h1>

      <div className={styles.card}>
        <h2>Your Account</h2>
        <p>Email: <strong>{user?.email}</strong></p>
      </div>

      <div className={styles.card}>
        <h2>Import from CSV</h2>
        <p>Import your reading list from Notion or another source. Expected CSV columns: Name, Author, Completed, Kind, Genre, Status, Rating</p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className={styles.importButton}
        >
          {importing ? 'Importing...' : 'Choose CSV File'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {result && (
          <div className={styles.result}>
            <p className={styles.summary}>
              ✓ {result.success} imported · ✗ {result.failed} failed
            </p>
            {result.errors.length > 0 && (
              <div className={styles.errors}>
                <strong>Issues:</strong>
                <ul>
                  {result.errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
                {result.errors.length > 5 && <p>... and {result.errors.length - 5} more</p>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h2>About</h2>
        <p>Reading Log v0.2.0 — A personal reading tracker built with Next.js and Supabase. Rebuilt with multi-user auth and improved data structure.</p>
      </div>
    </div>
  )
}
