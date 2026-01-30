"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { MobileNav } from '@/components/MobileNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, User as UserIcon } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function ProfilePage() {
  const { user, userData, logout } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(userData?.displayName || '')
  const [readingGoal, setReadingGoal] = useState(userData?.readingGoal || 24)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!user || !db) return

    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim() || null,
        readingGoal: readingGoal,
      })
      alert('Nastavení uloženo')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar selectedCategory="all" onCategoryChange={() => router.push('/')} />

      <main className="flex-1 flex flex-col lg:ml-0 pb-16 lg:pb-0">
        <header className="sticky top-0 z-40 bg-background border-b p-4 lg:p-6">
          <h1 className="text-2xl font-bold">Profil</h1>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Informace o účtu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ''} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Jméno</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Vaše jméno"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readingGoal">Čtecí cíl na rok</Label>
                  <Input
                    id="readingGoal"
                    type="number"
                    min="1"
                    max="365"
                    value={readingGoal}
                    onChange={(e) => setReadingGoal(parseInt(e.target.value) || 24)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Kolik knih chcete přečíst tento rok?
                  </p>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Ukládání...' : 'Uložit změny'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nebezpečná zóna</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Odhlásit se
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <MobileNav onAddClick={() => router.push('/')} />
      </main>
    </div>
  )
}
