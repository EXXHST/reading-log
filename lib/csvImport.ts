import Papa from 'papaparse'
import { supabase } from './supabase'

export interface CSVRow {
  Name?: string
  Author?: string
  Completed?: string
  Type?: string
  Kind?: string
  Genre?: string
  Status?: string
  Rating?: string
  Notes?: string
  Synopsis?: string
  Quotations?: string
}

export async function importBooksFromCSV(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: { data: CSVRow[] }) => {
        const errors: string[] = []
        let success = 0
        let failed = 0

        for (const row of results.data) {
          try {
            const finishedDate = row.Completed ? new Date(row.Completed) : null
            const isValidDate = finishedDate && !isNaN(finishedDate.getTime())

            // Parse quotes (comma-separated or newline-separated)
            let quotes: string[] = []
            if (row.Quotations) {
              quotes = row.Quotations.split('\n')
                .map((q) => q.trim())
                .filter((q) => q.length > 0)
            }

            const bookData = {
              id: `${row.Name}-${Date.now()}`,
              title: row.Name || 'Untitled',
              author: row.Author || '',
              genre: row.Genre || '',
              kind: row.Kind || row.Type || 'fiction',
              status: row.Status?.toLowerCase() === 'done' ? 'finished' : row.Status?.toLowerCase() || 'want',
              date_finished: isValidDate ? finishedDate.toISOString().split('T')[0] : null,
              rating: row.Rating ? Math.min(5, Math.max(0, parseInt(row.Rating))) : 0,
              synopsis: row.Notes || row.Synopsis || '',
              quotes: quotes,
              created_at: Date.now(),
            }

            const { error } = await supabase.from('books').insert([bookData])

            if (error) {
              failed++
              errors.push(`Row "${row.Name}": ${error.message}`)
            } else {
              success++
            }
          } catch (error) {
            failed++
            errors.push(`Row "${row.Name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

        resolve({ success, failed, errors })
      },
      error: (error) => {
        resolve({ success: 0, failed: 0, errors: [error.message] })
      },
    })
  })
}
