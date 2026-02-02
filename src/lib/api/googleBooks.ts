import { GoogleBooksResponse, GoogleBooksItem } from '@/types'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'

export async function searchBooks(query: string, maxResults: number = 20): Promise<GoogleBooksItem[]> {
  if (!query.trim()) return []

  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch books')
    }

    const data: GoogleBooksResponse = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error searching books:', error)
    return []
  }
}

export function formatBookFromGoogleBooks(item: GoogleBooksItem) {
  const volumeInfo = item.volumeInfo
  const isbn = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
  )?.identifier

  return {
    id: item.id,
    isbn: isbn || undefined, // undefined je OK zde, protože isbn je optional
    title: volumeInfo.title || 'Neznámý název',
    author: volumeInfo.authors?.join(', ') || 'Neznámý autor',
    description: volumeInfo.description || '',
    coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') || 
              volumeInfo.imageLinks?.smallThumbnail?.replace('http://', 'https://') || '',
    pageCount: volumeInfo.pageCount || 0,
    publishedYear: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.split('-')[0]) : null,
    genres: volumeInfo.categories || [],
  }
}
