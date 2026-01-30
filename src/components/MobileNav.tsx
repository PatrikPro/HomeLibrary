"use client"

import { useRouter, usePathname } from 'next/navigation'
import { BookOpen, BarChart3, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BookCategory } from '@/types'

interface MobileNavProps {
  onAddClick: () => void
}

export function MobileNav({ onAddClick }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { icon: BookOpen, label: 'Knihy', path: '/' },
    { icon: BarChart3, label: 'Statistiky', path: '/stats' },
    { icon: User, label: 'Profil', path: '/profile' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full min-h-[44px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={onAddClick}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full min-h-[44px] text-primary"
        >
          <div className="rounded-full bg-primary p-2">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xs">Přidat</span>
        </button>
      </div>
    </nav>
  )
}
