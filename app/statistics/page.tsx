'use client'

import { useEffect, useState } from 'react'
import { supabase, type Book } from '@/lib/supabase'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import styles from './statistics.module.css'

export default function Statistics() {
  const { user } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBooks: 0,
    thisYear: 0,
    lastYear: 0,
    averageRating: 0,
    totalNonFiction: 0,
    kindBreakdown: [] as any[],
    yearComparison: [] as any[],
  })

  useEffect(() => {
    if (user) {
      fetchBooksAndCalculateStats()
    }
  }, [user])

  async function fetchBooksAndCalculateStats() {
    try {
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'finished')

      if (booksData) {
        setBooks(booksData)
        calculateStats(booksData)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateStats(books: Book[]) {
    const now = new Date()
    const currentYear = now.getFullYear()
    const lastYear = currentYear - 1
    const twoYearsAgo = currentYear - 2

    const thisYearBooks = books.filter((b) => {
      if (!b.date_finished) return false
      return new Date(b.date_finished).getFullYear() === currentYear
    })

    const lastYearBooks = books.filter((b) => {
      if (!b.date_finished) return false
      return new Date(b.date_finished).getFullYear() === lastYear
    })

    const ratedBooks = books.filter((b) => b.rating > 0)
    const averageRating = ratedBooks.length > 0 ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1) : '0'

    const nonFictionBooks = books.filter((b) => b.kind && b.kind.toLowerCase() === 'non-fiction')

    const kindCounts: { [key: string]: number } = {}
    books.forEach((book) => {
      const kind = book.genre || 'Unknown'
      kindCounts[kind] = (kindCounts[kind] || 0) + 1
    })

    const kindBreakdown = Object.entries(kindCounts).map(([name, value]) => ({
      name,
      value,
    }))

    const yearComparison = [
      { year: lastYear.toString(), books: lastYearBooks.length },
      { year: currentYear.toString(), books: thisYearBooks.length },
    ]

    setStats({
      totalBooks: books.length,
      thisYear: thisYearBooks.length,
      lastYear: lastYearBooks.length,
      averageRating: parseFloat(averageRating as string),
      totalNonFiction: nonFictionBooks.length,
      kindBreakdown,
      yearComparison,
    })
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Calculating your reading statistics...</p>
      </div>
    )
  }

  const COLORS = ['#8b9d83', '#6b4423', '#b8a388', '#9a8f87', '#d4cfc7']

  return (
    <div className={styles.container}>
      <h1>Reading Statistics</h1>

      <div className={styles.summaryGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalBooks}</div>
          <div className={styles.statLabel}>Total books</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.thisYear}</div>
          <div className={styles.statLabel}>This year</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.averageRating}</div>
          <div className={styles.statLabel}>Average rating</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalNonFiction}</div>
          <div className={styles.statLabel}>Total non-fiction</div>
        </div>
      </div>

      <section className={styles.chartSection}>
        <h2>Monthly Reading Pace (Multi-Year Comparison)</h2>
        <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginBottom: '1rem' }}>
          Cumulative books read through each month, comparing across years
        </p>
        <MultiYearMonthlyChart books={books} currentYear={new Date().getFullYear()} />
      </section>

      <section className={styles.chartSection}>
        <h2>Books by Kind</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stats.kindBreakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
            <XAxis dataKey="name" stroke="var(--secondary-text)" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="var(--secondary-text)" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--warm-white)',
                border: '1px solid var(--card-border)',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'var(--warm-brown)' }}
            />
            <Bar dataKey="value" fill="var(--sage-green)" label={{ position: 'top', fill: 'var(--warm-brown)', fontSize: 12, fontWeight: 'bold' }} />
          </BarChart>
        </ResponsiveContainer>
      </section>

    </div>
  )
}

function MultiYearMonthlyChart({ books, currentYear }: { books: Book[]; currentYear: number }) {
  const monthlyData: { [year: number]: { [month: number]: number } } = {}

  books.forEach((book) => {
    if (book.date_finished) {
      const date = new Date(book.date_finished)
      const year = date.getFullYear()
      const month = date.getMonth()

      if (!monthlyData[year]) {
        monthlyData[year] = {}
      }

      monthlyData[year][month] = (monthlyData[year][month] || 0) + 1
    }
  })

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const years = Object.keys(monthlyData)
    .map(Number)
    .sort((a, b) => b - a)
    .slice(0, 3)

  const now = new Date()
  const currentMonth = now.getMonth()

  const data = months.map((name, index) => {
    const obj: any = { month: name }
    years.forEach((year) => {
      // For the current year, only include data up to current month
      if (year === currentYear && index > currentMonth) {
        return // Skip this month for current year
      }
      let cumulative = 0
      for (let m = 0; m <= index; m++) {
        cumulative += monthlyData[year]?.[m] || 0
      }
      obj[`year-${year}`] = cumulative
    })
    return obj
  }).slice(0, currentMonth + 1) // Only include months up to current month

  const colors = ['var(--sage-green)', 'var(--warm-brown)', 'var(--accent-light)']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
        <XAxis dataKey="month" stroke="var(--secondary-text)" />
        <YAxis stroke="var(--secondary-text)" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--warm-white)',
            border: '1px solid var(--card-border)',
            borderRadius: '6px',
          }}
          labelStyle={{ color: 'var(--warm-brown)' }}
        />
        <Legend />
        {years.map((year, idx) => (
          <Line
            key={year}
            type="monotone"
            dataKey={`year-${year}`}
            stroke={colors[idx]}
            dot={{ fill: 'var(--warm-brown)', r: 3 }}
            strokeWidth={2}
            name={year.toString()}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
