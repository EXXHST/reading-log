'use client'

import { useState } from 'react'
import { supabase, type Book } from '@/lib/supabase'
import styles from './BookDetail.module.css'

interface BookDetailProps {
  book: Book
  onBack: () => void
  onUpdate: () => void
}

export default function BookDetail({ book: initialBook, onBack, onUpdate }: BookDetailProps) {
  const [book, setBook] = useState(initialBook)
  const [isSaving, setIsSaving] = useState(false)

  async function saveField(field: string, value: any) {
    setIsSaving(true)
    try {
      // Don't save goodreads_url yet - database column doesn't exist
      if (field === 'goodreads_url') {
        setBook({ ...book, [field]: value })
        return
      }

      const updateData = { [field]: value }
      const { error } = await supabase.from('books').update(updateData).eq('id', book.id)

      if (!error) {
        setBook({ ...book, [field]: value })
        onUpdate()
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error saving changes')
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteBook() {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await supabase.from('books').delete().eq('id', book.id)
        onBack()
        onUpdate()
      } catch (error) {
        console.error('Error deleting book:', error)
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

  return (
    <div className={styles.container}>
      <button onClick={onBack} className={styles.backButton}>
        ← Back to Catalogue
      </button>

      <div className={styles.header}>
        <h1 style={{ marginBottom: '0.5rem' }}>Edit Book Details</h1>
        <button onClick={() => deleteBook()} className={styles.deleteButton}>
          Delete
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={book.title}
              onChange={(e) => {
                setBook({ ...book, title: e.target.value })
                saveField('title', e.target.value)
              }}
              placeholder="Book title"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Author</label>
            <input
              type="text"
              value={book.author}
              onChange={(e) => {
                setBook({ ...book, author: e.target.value })
                saveField('author', e.target.value)
              }}
              placeholder="Author name"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Kind</label>
            <select
              value={book.kind}
              onChange={(e) => {
                setBook({ ...book, kind: e.target.value })
                saveField('kind', e.target.value)
              }}
            >
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-fiction</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Genre</label>
            <input
              type="text"
              value={book.genre}
              onChange={(e) => {
                setBook({ ...book, genre: e.target.value })
                saveField('genre', e.target.value)
              }}
              placeholder="e.g. Literary Fiction, Science Fiction, Mystery"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Rating (1-5)</label>
            <select
              value={book.rating}
              onChange={(e) => {
                const rating = parseInt(e.target.value)
                setBook({ ...book, rating })
                saveField('rating', rating)
              }}
            >
              <option value="0">Not rated</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Finish Date</label>
            <input
              type="date"
              value={book.date_finished || ''}
              onChange={(e) => {
                const date = e.target.value || null
                setBook({ ...book, date_finished: date })
                saveField('date_finished', date)
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={book.status}
              onChange={(e) => {
                setBook({ ...book, status: e.target.value })
                saveField('status', e.target.value)
              }}
            >
              <option value="want">Not started</option>
              <option value="reading">In progress</option>
              <option value="finished">Finished</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Goodreads URL</label>
          <input
            type="url"
            value={book.goodreads_url || ''}
            onChange={(e) => {
              setBook({ ...book, goodreads_url: e.target.value })
              saveField('goodreads_url', e.target.value || null)
            }}
            placeholder="https://www.goodreads.com/book/show/..."
          />
          {book.goodreads_url && (
            <a
              href={book.goodreads_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: '0.5rem',
                fontSize: '12px',
                color: 'var(--sage-green)',
                textDecoration: 'underline',
              }}
            >
              Open on Goodreads →
            </a>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Notes</label>
          <textarea
            value={book.synopsis}
            onChange={(e) => {
              setBook({ ...book, synopsis: e.target.value })
              saveField('synopsis', e.target.value)
            }}
            placeholder="Your thoughts and reflections about this book..."
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label>Quotations</label>
            <button
              type="button"
              onClick={() => {
                const newQuotes = [...(book.quotes || []), '']
                setBook({ ...book, quotes: newQuotes })
                saveField('quotes', newQuotes)
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
                  setBook({ ...book, quotes: newQuotes })
                  saveField('quotes', newQuotes)
                }}
                placeholder={`Quotation ${index + 1}`}
                className={styles.textarea}
                style={{ minHeight: '80px', flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  const newQuotes = (book.quotes || []).filter((_, i) => i !== index)
                  setBook({ ...book, quotes: newQuotes })
                  saveField('quotes', newQuotes)
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

        <p style={{ fontSize: '12px', color: 'var(--light-text)', marginTop: '2rem', fontStyle: 'italic' }}>
          Changes are saved automatically as you type
        </p>
      </div>
    </div>
  )
}
