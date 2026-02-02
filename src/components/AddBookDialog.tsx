"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { addBook } from '@/lib/hooks/useBooks'
import { searchBooks, formatBookFromGoogleBooks } from '@/lib/api/googleBooks'
import { GoogleBooksItem, Book } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Search, Loader2, Plus } from 'lucide-react'
import Image from 'next/image'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { BookCategory } from '@/types'

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBookDialog({ open, onOpenChange }: AddBookDialogProps) {
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GoogleBooksItem[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedBook, setSelectedBook] = useState<GoogleBooksItem | null>(null)
  const [category, setCategory] = useState<BookCategory>('wishlist')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setSearchResults([])
      setSearchError(null)
      setSelectedBook(null)
      setCategory('wishlist')
    }
  }, [open])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchError(null)
      return
    }

    // Zvýšený debounce timeout na 800ms, aby se snížil počet API požadavků
    const timeoutId = setTimeout(async () => {
      setSearching(true)
      setSearchError(null)
      const result = await searchBooks(searchQuery)
      setSearchResults(result.items)
      setSearchError(result.error)
      setSearching(false)
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleAddBook = async (bookItem: GoogleBooksItem) => {
    if (!user) return

    setAdding(true)
    try {
      const formatted = formatBookFromGoogleBooks(bookItem)
      
      // Vytvořit data BEZ undefined hodnot
      const bookData: Omit<Book, 'id' | 'addedAt'> = {
        title: formatted.title || 'Neznámý název',
        author: formatted.author || 'Neznámý autor',
        description: formatted.description || '',
        coverUrl: formatted.coverUrl || '',
        pageCount: formatted.pageCount || 0,
        publishedYear: formatted.publishedYear ?? null,
        genres: formatted.genres || [],
        category,
        userId: user.uid,
        isManual: false,
        // DŮLEŽITÉ: Explicitně nastavit rating a notes
        rating: null,
        notes: '',
      }

      // Přidat ISBN pouze pokud existuje
      if (formatted.isbn) {
        bookData.isbn = formatted.isbn
      }

      await addBook(bookData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding book:', error)
      alert('Chyba při přidávání knihy')
    } finally {
      setAdding(false)
    }
  }

  const handleManualAdd = () => {
    if (!user) return
    // TODO: Implement manual add form
    alert('Manuální přidání bude brzy dostupné')
  }

  const content = (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Vyhledat knihu</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Název knihy nebo autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {searchQuery && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Kategorie</label>
            <Select value={category} onValueChange={(v) => setCategory(v as BookCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wishlist">📚 Chci přečíst</SelectItem>
                <SelectItem value="reading">📖 Právě čtu</SelectItem>
                <SelectItem value="finished">✅ Přečteno</SelectItem>
                <SelectItem value="owned">🏠 Moje knihovna</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {searching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-muted-foreground">
              Nalezeno {searchResults.length} knih
            </p>
            {searchResults.map((item) => {
              const volumeInfo = item.volumeInfo
              const coverUrl = volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://') ||
                              volumeInfo.imageLinks?.smallThumbnail?.replace('http://', 'https://')
              
              return (
                <Card
                  key={item.id}
                  className="p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleAddBook(item)}
                >
                  <div className="flex gap-3">
                    {coverUrl && (
                      <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                        <Image
                          src={coverUrl}
                          alt={volumeInfo.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {volumeInfo.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {volumeInfo.authors?.join(', ') || 'Neznámý autor'}
                      </p>
                      {volumeInfo.publishedDate && (
                        <p className="text-xs text-muted-foreground">
                          {volumeInfo.publishedDate.split('-')[0]}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddBook(item)
                      }}
                      disabled={adding}
                    >
                      {adding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {searchError && (
          <div className="text-center py-4 px-4 bg-destructive/10 border border-destructive/20 rounded-md space-y-3">
            <p className="text-sm text-destructive">{searchError}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                if (!searchQuery.trim()) return
                setSearching(true)
                setSearchError(null)
                const result = await searchBooks(searchQuery)
                setSearchResults(result.items)
                setSearchError(result.error)
                setSearching(false)
              }}
              disabled={searching}
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Zkouším znovu...
                </>
              ) : (
                'Zkusit znovu'
              )}
            </Button>
          </div>
        )}

        {!searching && searchQuery && searchResults.length === 0 && !searchError && (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              Žádné výsledky pro &quot;{searchQuery}&quot;
            </p>
            <Button variant="outline" onClick={handleManualAdd}>
              Přidat manuálně
            </Button>
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Začněte vyhledáváním knihy podle názvu nebo autora
            </p>
            <Button variant="outline" onClick={handleManualAdd}>
              Přidat knihu manuálně
            </Button>
          </div>
        )}
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>Přidat knihu</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Přidat knihu</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
