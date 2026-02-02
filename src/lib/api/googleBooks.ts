import { GoogleBooksResponse, GoogleBooksItem } from '@/types'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'

export interface SearchResult {
  items: GoogleBooksItem[]
  error: string | null
}

export async function searchBooks(query: string, maxResults: number = 20): Promise<SearchResult> {
  if (!query.trim()) return { items: [], error: null }

  try {
    // Sestavit URL s parametry
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      printType: 'books',
    })
    
    // Přidat API klíč pokud je k dispozici
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
    if (apiKey) {
      params.append('key', apiKey)
    }

    const url = `${GOOGLE_BOOKS_API}?${params.toString()}`
    console.log('Searching books:', url.replace(apiKey || '', '[API_KEY]'))
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Books API error:', response.status, errorText)
      return { 
        items: [], 
        error: `API chyba: ${response.status}. Zkuste to znovu za chvíli.` 
      }
    }

    const data: GoogleBooksResponse = await response.json()
    console.log('Search results:', data.totalItems, 'items found')
    return { items: data.items || [], error: null }
  } catch (error) {
    console.error('Error searching books:', error)
    const message = error instanceof Error ? error.message : 'Neznámá chyba'
    return { 
      items: [], 
      error: `Chyba při vyhledávání: ${message}` 
    }
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
