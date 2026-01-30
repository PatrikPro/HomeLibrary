"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/types'

interface AuthContextType {
  user: FirebaseUser | null
  userData: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  isWhitelisted: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined' || !auth) {
      setLoading(false)
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Load user data from Firestore
        if (!db) return
        // TypeScript type narrowing - db is guaranteed to be defined after the check
        const firestoreDb = db
        const userDoc = await getDoc(doc(firestoreDb, 'users', firebaseUser.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: data.displayName || firebaseUser.displayName,
            createdAt: data.createdAt?.toDate() || new Date(),
            theme: data.theme || 'system',
            readingGoal: data.readingGoal || 24,
            settings: data.settings || { defaultView: 'grid', notificationsEnabled: true }
          })
        } else {
          // Create user document if it doesn't exist
          const newUserData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            createdAt: new Date(),
            theme: 'system',
            readingGoal: 24,
            settings: { defaultView: 'grid', notificationsEnabled: true }
          }
          await setDoc(doc(firestoreDb, 'users', firebaseUser.uid), {
            ...newUserData,
            createdAt: serverTimestamp()
          })
          setUserData(newUserData)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])
  
  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
    }
  }, [])

  const isWhitelisted = async (email: string): Promise<boolean> => {
    if (!db) return true // Allow first users if Firebase not initialized
    try {
      // TypeScript type narrowing - db is guaranteed to be defined after the check
      const firestoreDb = db
      const settingsDoc = await getDoc(doc(firestoreDb, 'settings', 'whitelist'))
      if (!settingsDoc.exists()) {
        // If whitelist doesn't exist, allow first 2 users
        return true
      }
      const allowedEmails = settingsDoc.data().allowedEmails || []
      return allowedEmails.includes(email)
    } catch (error) {
      console.error('Error checking whitelist:', error)
      return false
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase není inicializováno')
    const whitelisted = await isWhitelisted(email)
    if (!whitelisted) {
      throw new Error('Tento email není povolen. Aplikace je určena pouze pro 2 uživatele.')
    }
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (email: string, password: string, displayName: string) => {
    if (!auth || !db) throw new Error('Firebase není inicializováno')
    const whitelisted = await isWhitelisted(email)
    if (!whitelisted) {
      throw new Error('Tento email není povolen. Aplikace je určena pouze pro 2 uživatele.')
    }
    // TypeScript type narrowing - auth and db are guaranteed to be defined after the check
    const firebaseAuth = auth
    const firestoreDb = db
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    await setDoc(doc(firestoreDb, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      theme: 'system',
      readingGoal: 24,
      settings: { defaultView: 'grid', notificationsEnabled: true }
    })
  }

  const loginWithGoogle = async () => {
    if (!auth || !db) throw new Error('Firebase není inicializováno')
    // TypeScript type narrowing - auth and db are guaranteed to be defined after the check
    const firebaseAuth = auth
    const firestoreDb = db
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(firebaseAuth, provider)
    const email = result.user.email!
    const whitelisted = await isWhitelisted(email)
    if (!whitelisted) {
      await signOut(firebaseAuth)
      throw new Error('Tento email není povolen. Aplikace je určena pouze pro 2 uživatele.')
    }
    // Create user document if it doesn't exist
    const userDoc = await getDoc(doc(firestoreDb, 'users', result.user.uid))
    if (!userDoc.exists()) {
      await setDoc(doc(firestoreDb, 'users', result.user.uid), {
        uid: result.user.uid,
        email,
        displayName: result.user.displayName || undefined,
        createdAt: serverTimestamp(),
        theme: 'system',
        readingGoal: 24,
        settings: { defaultView: 'grid', notificationsEnabled: true }
      })
    }
  }

  const logout = async () => {
    if (!auth) throw new Error('Firebase není inicializováno')
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, signup, logout, loginWithGoogle, isWhitelisted }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
