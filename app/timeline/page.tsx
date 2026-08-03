'use client'

import { useEffect, useState } from 'react'
import { supabase, type Book } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import BookDetail from '../components/BookDetail'
import styles from './timeline.module.css'

export default function Timeline() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBooks()
    }
  }, [user])

  async function fetchBooks() {
    try {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'finished')
        .order('date_finished', { ascending: false })

      if (data) {
        setBooks(data)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('en-GB', { month: 'short' })
    return `${day} ${month}`
  }

  // Group books by year
  const booksByYear = books.reduce(
    (acc, book) => {
      if (!book.date_finished) return acc
      const year = new Date(book.date_finished).getFullYear()
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(book)
      return acc
    },
    {} as Record<number, Book[]>
  )

  const years = Object.keys(booksByYear)
    .map(Number)
    .sort((a, b) => b - a)

  if (selectedBook) {
    return <BookDetail book={selectedBook} onBack={() => setSelectedBook(null)} onUpdate={fetchBooks} />
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading your timeline...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1>Reading Timeline</h1>

      {years.length === 0 ? (
        <p className={styles.empty}>No finished books yet. Start reading to build your timeline!</p>
      ) : (
        <div className={styles.timeline}>
          {years.map((year) => (
            <div key={year} className={styles.yearSection}>
              <div className={styles.yearMarker}>
                <div className={styles.yearDot} />
                <h2 className={styles.yearLabel}>{year}</h2>
              </div>

              <div className={styles.booksContainer}>
                {booksByYear[year].map((book) => (
                  <div
                    key={book.id}
                    className={styles.bookCard}
                    onClick={() => setSelectedBook(book)}
                    style={{
                      backgroundColor:
                        book.kind === 'non-fiction' ? 'rgba(207, 102, 121, 0.08)' : 'transparent',
                    }}
                  >
                    <div className={styles.bookHeader}>
                      <h3 className={styles.bookTitle}>{book.title}</h3>
                      {book.rating > 0 && <span className={styles.rating}>★ {book.rating}</span>}
                    </div>
                    <p className={styles.bookAuthor}>{book.author}</p>

                    <div className={styles.bookMeta}>
                      <span className={styles.genre}>{book.genre}</span>
                      <span className={styles.date}>{formatDate(book.date_finished)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
