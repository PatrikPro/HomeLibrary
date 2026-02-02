"use client"

import { useState, useEffect } from 'react'
import { 
  collection, 
  query as firestoreQuery, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Book, BookCategory } from '@/types'

export function useBooks(userId?: string, category?: BookCategory) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || !db) {
      setLoading(false)
      return
    }

    // TypeScript type narrowing - db is guaranteed to be defined after the check
    const firestoreDb = db
    let q = firestoreQuery(collection(firestoreDb, 'books'), orderBy('addedAt', 'desc'))
    
    if (category) {
      q = firestoreQuery(
        collection(firestoreDb, 'books'),
        where('category', '==', category),
        orderBy('addedAt', 'desc')
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const booksData: Book[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          booksData.push({
            id: doc.id,
            ...data,
            addedAt: data.addedAt?.toDate() || new Date(),
            finishedAt: data.finishedAt?.toDate() || undefined,
          } as Book)
        })
        setBooks(booksData)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching books:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, category])

  return { books, loading }
}

export async function addBook(bookData: Omit<Book, 'id' | 'addedAt'>): Promise<string> {
  if (!db) throw new Error('Firebase není inicializováno')
  // TypeScript type narrowing - db is guaranteed to be defined after the check
  const firestoreDb = db
  
  // Vyčisti data - odstraň všechny undefined hodnoty
  const cleanData = Object.fromEntries(
    Object.entries(bookData).filter(([_, v]) => v !== undefined)
  )
  
  const docRef = await addDoc(collection(firestoreDb, 'books'), {
    ...cleanData,
    addedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateBook(bookId: string, updates: Partial<Book>): Promise<void> {
  if (!db) throw new Error('Firebase není inicializováno')
  // TypeScript type narrowing - db is guaranteed to be defined after the check
  const firestoreDb = db
  const bookRef = doc(firestoreDb, 'books', bookId)
  const updateData: any = { ...updates }
  
  if (updates.finishedAt) {
    updateData.finishedAt = updates.finishedAt instanceof Date 
      ? Timestamp.fromDate(updates.finishedAt)
      : serverTimestamp()
  }
  
  delete updateData.id
  delete updateData.addedAt
  
  await updateDoc(bookRef, updateData)
}

export async function deleteBook(bookId: string): Promise<void> {
  if (!db) throw new Error('Firebase není inicializováno')
  // TypeScript type narrowing - db is guaranteed to be defined after the check
  const firestoreDb = db
  await deleteDoc(doc(firestoreDb, 'books', bookId))
}

export async function searchBooksInLibrary(searchQuery: string, userId?: string): Promise<Book[]> {
  if (!searchQuery.trim() || !db) return []
  
  // TypeScript type narrowing - db is guaranteed to be defined after the check
  const firestoreDb = db
  const q = firestoreQuery(collection(firestoreDb, 'books'), orderBy('addedAt', 'desc'))
  const snapshot = await getDocs(q)
  
  const results: Book[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    const book = {
      id: doc.id,
      ...data,
      addedAt: data.addedAt?.toDate() || new Date(),
      finishedAt: data.finishedAt?.toDate() || undefined,
    } as Book
    
    const searchLower = searchQuery.toLowerCase()
    if (
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.description.toLowerCase().includes(searchLower)
    ) {
      results.push(book)
    }
  })
  
  return results
}
