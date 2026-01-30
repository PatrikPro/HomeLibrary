"use client"

import Image from 'next/image'
import { Book } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookCardProps {
  book: Book
  onClick: () => void
  view?: 'grid' | 'list'
}

const categoryLabels: Record<Book['category'], string> = {
  wishlist: 'Chci přečíst',
  reading: 'Právě čtu',
  finished: 'Přečteno',
  owned: 'Moje knihovna',
}

const categoryEmojis: Record<Book['category'], string> = {
  wishlist: '📚',
  reading: '📖',
  finished: '✅',
  owned: '🏠',
}

export function BookCard({ book, onClick, view = 'grid' }: BookCardProps) {
  if (view === 'list') {
    return (
      <Card
        className="flex gap-4 p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={onClick}
      >
        <div className="relative w-16 h-24 md:w-20 md:h-28 flex-shrink-0 rounded overflow-hidden bg-muted">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-2xl">📖</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base md:text-lg line-clamp-2">{book.title}</h3>
            {book.rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm">{book.rating}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {categoryEmojis[book.category]} {categoryLabels[book.category]}
            </Badge>
            {book.publishedYear && (
              <span className="text-xs text-muted-foreground">{book.publishedYear}</span>
            )}
            {book.pageCount && (
              <span className="text-xs text-muted-foreground">{book.pageCount} str.</span>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] bg-muted">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-4xl">📖</span>
          </div>
        )}
        {book.rating && (
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-semibold">{book.rating}</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {categoryEmojis[book.category]}
          </Badge>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{book.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
        {book.publishedYear && (
          <p className="text-xs text-muted-foreground">{book.publishedYear}</p>
        )}
      </div>
    </Card>
  )
}
