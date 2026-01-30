"use client"

import { Book } from '@/types'
import { BookCard } from './BookCard'
import { cn } from '@/lib/utils'

interface BookGridProps {
  books: Book[]
  onBookClick: (book: Book) => void
  view?: 'grid' | 'list'
  loading?: boolean
}

export function BookGrid({ books, onBookClick, view = 'grid', loading }: BookGridProps) {
  if (loading) {
    return (
      <div className={cn(
        view === 'grid'
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          : "flex flex-col gap-2"
      )}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              view === 'grid'
                ? "aspect-[2/3] bg-muted animate-pulse rounded-lg"
                : "h-24 bg-muted animate-pulse rounded-lg"
            )}
          />
        ))}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Žádné knihy v této kategorii</p>
      </div>
    )
  }

  if (view === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => onBookClick(book)}
            view="list"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={() => onBookClick(book)}
          view="grid"
        />
      ))}
    </div>
  )
}
