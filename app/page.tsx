'use client'

import { useEffect, useState } from 'react'
import { supabase, type Book } from '@/lib/supabase'
import { useAuth } from './context/AuthContext'
import styles from './page.module.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [readingBooks, setReadingBooks] = useState<Book[]>([])
  const [quotation, setQuotation] = useState('')
  const [quotationAuthor, setQuotationAuthor] = useState('')
  const [quotationBook, setQuotationBook] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  async function fetchData() {
    try {
      // Fetch currently reading books
      const { data: readingData } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'reading')
        .order('created_at', { ascending: false })

      if (readingData) {
        setReadingBooks(readingData)
      }

      // Get random quotation from all books
      const { data: allBooks } = await supabase
        .from('books')
        .select('*')

      if (allBooks) {
        const allQuotes: { quote: string; author: string; title: string }[] = []
        allBooks.forEach((book) => {
          if (book.quotes && Array.isArray(book.quotes)) {
            book.quotes.forEach((q: string) => {
              allQuotes.push({
                quote: q,
                author: book.author,
                title: book.title,
              })
            })
          }
        })

        if (allQuotes.length > 0) {
          const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)]
          setQuotation(randomQuote.quote)
          setQuotationAuthor(randomQuote.author)
          setQuotationBook(randomQuote.title)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddBook() {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      user_id: user?.id || '',
      title: '',
      author: '',
      kind: 'fiction',
      genre: '',
      status: 'reading',
      date_finished: null,
      rating: 0,
      synopsis: '',
      quotes: [],
      created_at: Date.now(),
    }

    setReadingBooks([newBook, ...readingBooks])
  }

  async function saveBook(book: Book) {
    if (!book.title.trim()) {
      alert('Please enter a book title')
      return
    }

    if (!book.user_id) {
      alert('Please log in to save books')
      return
    }

    try {
      const isNewBook = book.id.startsWith('book-')

      // Remove goodreads_url since the database column doesn't exist yet
      const { goodreads_url, ...bookToSave } = book

      if (isNewBook) {
        // For new books, generate a proper UUID instead of temporary id
        const newId = crypto.randomUUID()
        const bookWithId = { ...bookToSave, id: newId }

        const { error } = await supabase.from('books').insert([bookWithId])
        if (error) throw error

        // Update the book in state with the real ID
        setReadingBooks(readingBooks.map((b) => (b.id === book.id ? { ...book, id: newId } : b)))
      } else {
        // For existing books, update normally
        const { error } = await supabase.from('books').update(bookToSave).eq('id', book.id)
        if (error) throw error
      }

      fetchData()
    } catch (error) {
      console.error('Error saving book:', error)
      let errorMessage = 'Unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error)
      }
      alert(`Error saving book: ${errorMessage}`)
    }
  }

  async function removeBook(bookId: string) {
    if (window.confirm('Remove this book from currently reading?')) {
      try {
        await supabase.from('books').delete().eq('id', bookId)
        setReadingBooks(readingBooks.filter((b) => b.id !== bookId))
      } catch (error) {
        console.error('Error removing book:', error)
      }
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('en-GB', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading your reading log...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Currently Reading Section */}
      <section className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Currently Reading</h2>
          <button onClick={handleAddBook} className={styles.addButton}>
            + Add new book
          </button>
        </div>

        {readingBooks.map((book, index) => (
          <CurrentlyReadingForm
            key={book.id}
            book={book}
            onSave={saveBook}
            onRemove={removeBook}
            onUpdate={(updated) => setReadingBooks(readingBooks.map((b) => (b.id === book.id ? updated : b)))}
            isLast={index === readingBooks.length - 1}
            formatDate={formatDate}
          />
        ))}

        {readingBooks.length === 0 && (
          <p className={styles.placeholder}>Add a book to start tracking your reading progress</p>
        )}
      </section>

      {/* Featured Quotation */}
      <section className={styles.quotationSection}>
        {quotation ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
              <button
                onClick={fetchData}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--warm-brown)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: 0.6,
                  padding: '4px 8px',
                }}
                title="Load new quotation"
              >
                ↻
              </button>
            </div>
            <p className={styles.quotation}>{quotation}</p>
            <p className={styles.quotationRef}>
              {quotationAuthor}, {quotationBook}
            </p>
          </div>
        ) : (
          <p className={styles.quotationPlaceholder}>Add quotations to your books to see them featured here</p>
        )}
      </section>
    </div>
  )
}

interface CurrentlyReadingFormProps {
  book: Book
  onSave: (book: Book) => void
  onRemove: (bookId: string) => void
  onUpdate: (book: Book) => void
  isLast: boolean
  formatDate: (date: string | null) => string
}

function CurrentlyReadingForm({ book, onSave, onRemove, onUpdate, isLast, formatDate }: CurrentlyReadingFormProps) {
  const handleFinishDateChange = (date: string | null) => {
    const updated = { ...book, date_finished: date }
    onUpdate(updated)

    if (date) {
      updated.status = 'finished'
      onSave(updated)
    }
  }

  return (
    <div style={{ marginBottom: isLast ? 0 : '2rem', paddingBottom: isLast ? 0 : '2rem', borderBottom: isLast ? 'none' : '1px solid var(--card-border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.formGroup}>
          <label>Book Title</label>
          <input
            type="text"
            value={book.title}
            onChange={(e) => onUpdate({ ...book, title: e.target.value })}
            placeholder="Enter book title"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Author</label>
          <input
            type="text"
            value={book.author}
            onChange={(e) => onUpdate({ ...book, author: e.target.value })}
            placeholder="Author name"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.formGroup}>
          <label>Kind</label>
          <select value={book.kind} onChange={(e) => onUpdate({ ...book, kind: e.target.value })}>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-fiction</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Genre</label>
          <input
            type="text"
            value={book.genre}
            onChange={(e) => onUpdate({ ...book, genre: e.target.value })}
            placeholder="e.g. Literary Fiction, Mystery, Biography"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.formGroup}>
          <label>Finish Date</label>
          <input
            type="date"
            value={book.date_finished || ''}
            onChange={(e) => handleFinishDateChange(e.target.value || null)}
            placeholder="Mark as finished"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Status</label>
          <select value={book.status} onChange={(e) => onUpdate({ ...book, status: e.target.value })}>
            <option value="want">Not started</option>
            <option value="reading">In progress</option>
            <option value="finished">Finished</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.formGroup}>
          <label>Rating (1-5)</label>
          <select value={book.rating} onChange={(e) => onUpdate({ ...book, rating: parseInt(e.target.value) })}>
            <option value="0">Not rated</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Goodreads URL</label>
          <input
            type="url"
            value={book.goodreads_url || ''}
            onChange={(e) => onUpdate({ ...book, goodreads_url: e.target.value })}
            placeholder="https://www.goodreads.com/book/show/..."
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label>Quotations</label>
          <button
            type="button"
            onClick={() => {
              const newQuotes = [...(book.quotes || []), '']
              onUpdate({ ...book, quotes: newQuotes })
            }}
            style={{
              background: 'var(--sage-green)',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            + Add quotation
          </button>
        </div>

        {(book.quotes || []).map((quote, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <textarea
              value={quote}
              onChange={(e) => {
                const newQuotes = [...(book.quotes || [])]
                newQuotes[index] = e.target.value
                onUpdate({ ...book, quotes: newQuotes })
              }}
              placeholder={`Quotation ${index + 1}`}
              className={styles.textarea}
              style={{ minHeight: '80px', flex: 1 }}
            />
            <button
              type="button"
              onClick={() => {
                const newQuotes = (book.quotes || []).filter((_, i) => i !== index)
                onUpdate({ ...book, quotes: newQuotes })
              }}
              style={{
                background: '#c17054',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                alignSelf: 'flex-start',
                height: 'fit-content',
                whiteSpace: 'nowrap',
              }}
            >
              Remove
            </button>
          </div>
        ))}

        {(!book.quotes || book.quotes.length === 0) && (
          <p style={{ fontSize: '12px', color: 'var(--light-text)', fontStyle: 'italic', margin: '0.5rem 0' }}>
            No quotations yet. Click "Add quotation" to add one.
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>Notes</label>
        <textarea
          value={book.synopsis}
          onChange={(e) => onUpdate({ ...book, synopsis: e.target.value })}
          placeholder="Your thoughts and reflections"
          className={styles.textarea}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={() => onSave(book)} className={styles.button}>
          Save
        </button>
        {!book.id.startsWith('book-') && (
          <button onClick={() => onRemove(book.id)} className={styles.buttonDanger}>
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
