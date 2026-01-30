"use client"

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useBooks } from '@/lib/hooks/useBooks'
import { BookGrid } from '@/components/BookGrid'
import { SearchBar } from '@/components/SearchBar'
import { Sidebar } from '@/components/Sidebar'
import { MobileNav } from '@/components/MobileNav'
import { Button } from '@/components/ui/button'
import { Plus, Menu, Grid, List } from 'lucide-react'
import { Book, BookCategory } from '@/types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddBookDialog } from '@/components/AddBookDialog'
import { BookDetail } from '@/components/BookDetail'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { books, loading: booksLoading } = useBooks(user?.uid, selectedCategory === 'all' ? undefined : selectedCategory)

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books

    const query = searchQuery.toLowerCase()
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.description?.toLowerCase().includes(query)
    )
  }, [books, searchQuery])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const categories: Array<{ value: BookCategory | 'all'; label: string }> = [
    { value: 'all', label: 'Vše' },
    { value: 'wishlist', label: 'Chci přečíst' },
    { value: 'reading', label: 'Právě čtu' },
    { value: 'finished', label: 'Přečteno' },
    { value: 'owned', label: 'Knihovna' },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat)
          setSearchQuery('')
        }}
      />

      <main className="flex-1 flex flex-col lg:ml-0 pb-16 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-background border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Home Library</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              >
                {view === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </Button>
              <Button
                size="icon"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as BookCategory | 'all')}>
            <TabsList className="w-full overflow-x-auto">
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value} className="flex-shrink-0">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:block sticky top-0 z-40 bg-background border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              {selectedCategory === 'all'
                ? 'Všechny knihy'
                : categories.find((c) => c.value === selectedCategory)?.label}
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              >
                {view === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat knihu
              </Button>
            </div>
          </div>
          <div className="max-w-md">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <BookGrid
            books={filteredBooks}
            onBookClick={setSelectedBook}
            view={view}
            loading={booksLoading}
          />
        </div>

        {/* Mobile Navigation */}
        <MobileNav onAddClick={() => setIsAddDialogOpen(true)} />

        {/* Add Book Dialog */}
        <AddBookDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        {/* Book Detail */}
        {selectedBook && (
          <BookDetail
            book={selectedBook}
            open={!!selectedBook}
            onOpenChange={(open) => !open && setSelectedBook(null)}
          />
        )}
      </main>
    </div>
  )
}
