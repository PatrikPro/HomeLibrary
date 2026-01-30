"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateBook, deleteBook } from '@/lib/hooks/useBooks'
import { Book, BookCategory } from '@/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Star, Trash2, ArrowLeft, Save } from 'lucide-react'
import Image from 'next/image'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

interface BookDetailProps {
  book: Book
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categoryLabels: Record<BookCategory, string> = {
  wishlist: 'Chci přečíst',
  reading: 'Právě čtu',
  finished: 'Přečteno',
  owned: 'Moje knihovna',
}

export function BookDetail({ book, open, onOpenChange }: BookDetailProps) {
  const { user } = useAuth()
  const router = useRouter()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [category, setCategory] = useState<BookCategory>(book.category)
  const [rating, setRating] = useState<number | undefined>(book.rating)
  const [notes, setNotes] = useState(book.notes || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (open) {
      setCategory(book.category)
      setRating(book.rating)
      setNotes(book.notes || '')
    }
  }, [book, open])

  const handleSave = async () => {
    if (!user || user.uid !== book.userId) return

    setSaving(true)
    try {
      await updateBook(book.id, {
        category,
        rating,
        notes: notes.trim() || undefined,
        finishedAt: category === 'finished' && !book.finishedAt ? new Date() : book.finishedAt,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating book:', error)
      alert('Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user || user.uid !== book.userId) return
    if (!confirm('Opravdu chcete smazat tuto knihu?')) return

    setDeleting(true)
    try {
      await deleteBook(book.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Chyba při mazání')
    } finally {
      setDeleting(false)
    }
  }

  const canEdit = user?.uid === book.userId

  const content = (
    <div className="space-y-6">
      {/* Cover and Basic Info */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative w-full sm:w-48 h-72 sm:h-80 flex-shrink-0 rounded-lg overflow-hidden bg-muted mx-auto sm:mx-0">
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-6xl">📖</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{book.title}</h2>
            <p className="text-lg text-muted-foreground">{book.author}</p>
          </div>

          {canEdit && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Kategorie</label>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Hodnocení</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(rating === value ? undefined : value)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating && value <= rating
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!canEdit && (
            <div className="space-y-2">
              <Badge variant="secondary">{categoryLabels[book.category]}</Badge>
              {book.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span>{book.rating}/5</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {book.pageCount && <span>📄 {book.pageCount} str.</span>}
            {book.publishedYear && <span>📅 {book.publishedYear}</span>}
            {book.genres && book.genres.length > 0 && (
              <span>🏷️ {book.genres.slice(0, 2).join(', ')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div>
          <h3 className="font-semibold mb-2">Popis</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {book.description}
          </p>
        </div>
      )}

      {/* Notes */}
      {canEdit && (
        <div>
          <label className="text-sm font-medium mb-2 block">Moje poznámka</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Přidejte si poznámku k této knize..."
            rows={4}
            className="resize-none"
          />
        </div>
      )}

      {!canEdit && book.notes && (
        <div>
          <h3 className="font-semibold mb-2">Poznámka</h3>
          <p className="text-sm text-muted-foreground">{book.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>Přidáno: {format(book.addedAt, 'd. M. yyyy')}</p>
        {book.finishedAt && (
          <p>Dokončeno: {format(book.finishedAt, 'd. M. yyyy')}</p>
        )}
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Mazání...' : 'Smazat'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Ukládání...' : 'Uložit'}
          </Button>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] overflow-y-auto">
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  )
}
