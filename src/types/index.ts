export type BookCategory = 'wishlist' | 'reading' | 'finished' | 'owned'

export interface Book {
  id: string
  isbn?: string
  title: string
  author: string
  description?: string
  coverUrl?: string
  pageCount?: number
  publishedYear?: number
  genres?: string[]
  userId: string
  category: BookCategory
  rating?: number // 1-5
  notes?: string
  addedAt: Date
  finishedAt?: Date
  isManual: boolean
}

export interface User {
  uid: string
  email: string
  displayName?: string
  createdAt: Date
  theme?: 'light' | 'dark' | 'system'
  readingGoal?: number
  settings?: {
    defaultView?: 'grid' | 'list'
    notificationsEnabled?: boolean
  }
}

export interface GoogleBooksItem {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    pageCount?: number
    publishedDate?: string
    categories?: string[]
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
  }
}

export interface GoogleBooksResponse {
  items?: GoogleBooksItem[]
  totalItems: number
}
