import { GoogleBooksResponse, GoogleBooksItem } from '@/types'

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'

// Cache pro výsledky vyhledávání (5 minut)
const searchCache = new Map<string, { items: GoogleBooksItem[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minut

export interface SearchResult {
  items: GoogleBooksItem[]
  error: string | null
}

async function fetchWithRetry(url: string, retries: number = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    const response = await fetch(url)
    
    // Pokud je 429 (rate limit), počkáme s exponential backoff
    if (response.status === 429 && i < retries) {
      const waitTime = Math.pow(2, i) * 1000 // 1s, 2s, 4s...
      console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}/${retries}`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      continue
    }
    
    return response
  }
  
  // Pokud všechny pokusy selhaly, vrátíme poslední response
  return fetch(url)
}

export async function searchBooks(query: string, maxResults: number = 40): Promise<SearchResult> {
  if (!query.trim()) return { items: [], error: null }

  // Zkontrolovat cache
  const cacheKey = `${query.toLowerCase()}_${maxResults}`
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached results for:', query)
    return { items: cached.items, error: null }
  }

  try {
    // Sestavit URL - jednoduchý přístup pro lepší výsledky
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
    let url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    
    // Přidat API klíč pokud je k dispozici
    if (apiKey) {
      url += `&key=${apiKey}`
    }

    console.log('Searching books:', url.replace(apiKey || '', '[API_KEY]'))
    
    const response = await fetchWithRetry(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Books API error:', response.status, errorText)
      
      let errorMessage = 'Chyba při vyhledávání'
      if (response.status === 429) {
        errorMessage = 'Příliš mnoho požadavků. Google Books API má omezení. Zkuste to za chvíli nebo přidejte API klíč pro vyšší limity.'
      } else if (response.status >= 500) {
        errorMessage = 'Chyba serveru. Zkuste to znovu za chvíli.'
      } else {
        errorMessage = `API chyba: ${response.status}. Zkuste to znovu za chvíli.`
      }
      
      return { 
        items: [], 
        error: errorMessage
      }
    }

    const data: GoogleBooksResponse = await response.json()
    const items = data.items || []
    
    // Uložit do cache
    searchCache.set(cacheKey, { items, timestamp: Date.now() })
    
    // Vyčistit staré cache položky (starší než 10 minut)
    const now = Date.now()
    for (const [key, value] of searchCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION * 2) {
        searchCache.delete(key)
      }
    }
    
    console.log('Search results:', data.totalItems, 'items found')
    return { items, error: null }
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
