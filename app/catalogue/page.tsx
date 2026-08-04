'use client'

import { useEffect, useState } from 'react'
import { supabase, type Book } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import BookDetail from '../components/BookDetail'
import styles from './catalogue.module.css'

export default function Catalogue() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [filters, setFilters] = useState({ kind: '', status: '' })
  const [sortBy, setSortBy] = useState('recently-completed')
  const [loading, setLoading] = useState(true)
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchBooks()
    }
  }, [user, filters, sortBy])

  async function fetchBooks() {
    try {
      let query = supabase.from('books').select('*')

      if (filters.kind) {
        query = query.eq('kind', filters.kind)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data } = await query

      if (data) {
        let sorted = [...data]

        switch (sortBy) {
          case 'recently-completed':
            sorted.sort((a, b) => {
              // Define status priority: reading (top), finished, want, abandoned (bottom)
              const statusPriority: { [key: string]: number } = {
                reading: 0,
                finished: 1,
                want: 2,
                abandoned: 3,
              }

              const aPriority = statusPriority[a.status] ?? 4
              const bPriority = statusPriority[b.status] ?? 4

              // If different status, sort by priority
              if (aPriority !== bPriority) {
                return aPriority - bPriority
              }

              // Same status: for finished books, sort by date (most recent first)
              if (a.status === 'finished') {
                if (!a.date_finished) return 1
                if (!b.date_finished) return -1
                return new Date(b.date_finished).getTime() - new Date(a.date_finished).getTime()
              }

              // For other statuses, keep original order
              return 0
            })
            break
          case 'title':
            sorted.sort((a, b) => a.title.localeCompare(b.title))
            break
          case 'author':
            sorted.sort((a, b) => a.author.localeCompare(b.author))
            break
          case 'rating-high':
            sorted.sort((a, b) => b.rating - a.rating)
            break
          case 'rating-low':
            sorted.sort((a, b) => a.rating - b.rating)
            break
          case 'genre':
            sorted.sort((a, b) => a.genre.localeCompare(b.genre))
            break
          case 'date-added':
            sorted.sort((a, b) => b.created_at - a.created_at)
            break
        }

        setBooks(sorted)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const kinds = Array.from(new Set(books.map((b) => b.kind).filter(Boolean)))
  const statuses = ['finished', 'reading', 'want', 'abandoned']

  const statusLabels: { [key: string]: string } = {
    finished: 'Finished',
    reading: 'In progress',
    want: 'Not started',
    abandoned: 'Abandoned',
  }

  const statusColors: { [key: string]: string } = {
    finished: '#5fa383',
    reading: '#d4a574',
    want: '#8b3a3a',
    abandoned: '#8b6f47',
  }

  async function updateBookStatus(bookId: string, newStatus: string) {
    try {
      await supabase.from('books').update({ status: newStatus }).eq('id', bookId)
      fetchBooks()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (selectedBook) {
    return <BookDetail book={selectedBook} onBack={() => setSelectedBook(null)} onUpdate={fetchBooks} />
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('en-GB', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  return (
    <div className={styles.container}>
      <h1>My Library</h1>

      <div className={styles.filters}>
        <select
          value={filters.kind}
          onChange={(e) => setFilters({ ...filters, kind: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All kinds</option>
          {kinds.map((kind) => (
            <option key={kind} value={kind || ''}>
              {kind}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className={styles.filterSelect}
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status || ''}>
              {statusLabels[status]}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.filterSelect}>
          <option value="recently-completed">Sort by recently completed</option>
          <option value="title">Sort by title</option>
          <option value="author">Sort by author</option>
          <option value="rating-high">Sort by rating (high to low)</option>
          <option value="rating-low">Sort by rating (low to high)</option>
          <option value="genre">Sort by genre</option>
          <option value="date-added">Sort by date added</option>
        </select>
      </div>

      {loading ? (
        <p>Loading your library...</p>
      ) : books.length === 0 ? (
        <p className={styles.empty}>No books found. Add your first book to get started.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <tbody>
              {books.map((book) => (
                <tr
                  key={book.id}
                  className={styles.tableRow}
                  onClick={() => setSelectedBook(book)}
                  style={{
                    backgroundColor: book.kind === 'non-fiction' ? 'rgba(207, 102, 121, 0.1)' : 'transparent',
                  }}
                >
                  <td className={styles.titleCell}>{book.title}</td>
                  <td className={styles.authorCell}>{book.author}</td>
                  <td className={styles.ratingCell}>
                    {book.rating > 0 && <span className={styles.badge}>★ {book.rating}</span>}
                  </td>
                  <td className={styles.typeCell}>{book.genre}</td>
                  <td className={styles.statusCell}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setStatusMenuOpen(statusMenuOpen === book.id ? null : book.id)
                        }}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: statusColors[book.status],
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'transform 0.2s',
                        }}
                        title={statusLabels[book.status]}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.3)'
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                        }}
                      />
                      {statusMenuOpen === book.id && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: '8px',
                            backgroundColor: 'white',
                            border: '1px solid var(--card-border)',
                            borderRadius: '6px',
                            zIndex: 1000,
                            minWidth: '140px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {statuses.map((status) => (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation()
                                updateBookStatus(book.id, status)
                                setStatusMenuOpen(null)
                              }}
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: 'var(--warm-brown)',
                                borderBottom: '1px solid var(--card-border)',
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--stat-bg)'
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-block',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: statusColors[status],
                                  marginRight: '8px',
                                  verticalAlign: 'middle',
                                }}
                              />
                              {statusLabels[status]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={styles.dateCell}>
                    {book.status === 'finished' && book.date_finished && formatDate(book.date_finished)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
