"use client"

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  BookMarked, 
  CheckCircle, 
  Library, 
  BarChart3, 
  User, 
  LogOut,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'
import { BookCategory } from '@/types'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface SidebarProps {
  selectedCategory?: BookCategory | 'all'
  onCategoryChange: (category: BookCategory | 'all') => void
}

export function Sidebar({ selectedCategory, onCategoryChange }: SidebarProps) {
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (stored) {
      setTheme(stored)
    } else if (userData?.theme) {
      setTheme(userData.theme)
    }
  }, [userData])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = document.documentElement
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.toggle('dark', systemTheme === 'dark')
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
  }

  const categories: Array<{ value: BookCategory | 'all'; label: string; icon: any }> = [
    { value: 'all', label: 'Všechny knihy', icon: Library },
    { value: 'wishlist', label: 'Chci přečíst', icon: BookOpen },
    { value: 'reading', label: 'Právě čtu', icon: BookMarked },
    { value: 'finished', label: 'Přečteno', icon: CheckCircle },
    { value: 'owned', label: 'Moje knihovna', icon: Library },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">Home Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {userData?.displayName || user?.email}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px]",
                selectedCategory === category.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {category.label}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-1">
        <button
          onClick={() => router.push('/stats')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px]",
            pathname === '/stats'
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <BarChart3 className="h-5 w-5" />
          Statistiky
        </button>
        <button
          onClick={() => router.push('/profile')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px]",
            pathname === '/profile'
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <User className="h-5 w-5" />
          Profil
        </button>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground min-h-[44px]"
        >
          {theme === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : theme === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
          Téma
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground min-h-[44px]"
        >
          <LogOut className="h-5 w-5" />
          Odhlásit se
        </button>
      </div>
    </aside>
  )
}
