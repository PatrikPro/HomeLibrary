"use client"

import { useAuth } from '@/contexts/AuthContext'
import { useBooks } from '@/lib/hooks/useBooks'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { MobileNav } from '@/components/MobileNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BookOpen, CheckCircle, TrendingUp, Award } from 'lucide-react'
import { useMemo } from 'react'
import { format, startOfYear } from 'date-fns'

export default function StatsPage() {
  const { user, userData, loading: authLoading } = useAuth()
  const router = useRouter()
  const { books, loading: booksLoading } = useBooks(user?.uid)

  const stats = useMemo(() => {
    const finished = books.filter((b) => b.category === 'finished')
    const reading = books.filter((b) => b.category === 'reading')
    const wishlist = books.filter((b) => b.category === 'wishlist')
    const owned = books.filter((b) => b.category === 'owned')

    // Books by month
    const currentYear = new Date().getFullYear()
    const thisYearBooks = finished.filter(
      (b) => b.finishedAt && b.finishedAt.getFullYear() === currentYear
    )

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const count = thisYearBooks.filter(
        (b) => b.finishedAt && b.finishedAt.getMonth() + 1 === month
      ).length
      return {
        month: format(new Date(2024, i, 1), 'MMM'),
        knihy: count,
      }
    })

    // Top authors
    const authorCounts: Record<string, number> = {}
    finished.forEach((book) => {
      authorCounts[book.author] = (authorCounts[book.author] || 0) + 1
    })
    const topAuthors = Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([author, count]) => ({ author, count }))

    // Average rating
    const ratedBooks = finished.filter((b) => b.rating)
    const avgRating =
      ratedBooks.length > 0
        ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
        : 0

    // Reading goal progress
    const goal = userData?.readingGoal || 24
    const progress = (thisYearBooks.length / goal) * 100

    // Category distribution
    const categoryData = [
      { name: 'Přečteno', value: finished.length, color: '#10b981' },
      { name: 'Právě čtu', value: reading.length, color: '#3b82f6' },
      { name: 'Chci přečíst', value: wishlist.length, color: '#f59e0b' },
      { name: 'Knihovna', value: owned.length, color: '#8b5cf6' },
    ]

    return {
      total: books.length,
      finished: finished.length,
      reading: reading.length,
      wishlist: wishlist.length,
      owned: owned.length,
      monthlyData,
      topAuthors,
      avgRating: avgRating.toFixed(1),
      goal,
      progress: Math.min(progress, 100),
      thisYearCount: thisYearBooks.length,
      categoryData,
    }
  }, [books, userData])

  if (authLoading || booksLoading) {
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar selectedCategory="all" onCategoryChange={() => router.push('/')} />

      <main className="flex-1 flex flex-col lg:ml-0 pb-16 lg:pb-0">
        <header className="sticky top-0 z-40 bg-background border-b p-4 lg:p-6">
          <h1 className="text-2xl font-bold">Statistiky</h1>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Celkem knih</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Přečteno</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.finished}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Právě čtu</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.reading}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Průměrné hodnocení</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRating}</div>
              </CardContent>
            </Card>
          </div>

          {/* Reading Goal */}
          <Card>
            <CardHeader>
              <CardTitle>Čtecí cíl {new Date().getFullYear()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {stats.thisYearCount} / {stats.goal} knih
                </span>
                <span>{Math.round(stats.progress)}%</span>
              </div>
              <Progress value={stats.progress} />
            </CardContent>
          </Card>

          {/* Monthly Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Přečtené knihy v roce {new Date().getFullYear()}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="knihy" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Rozložení kategorií</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Authors */}
          {stats.topAuthors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nejčtenější autoři</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topAuthors.map((author, index) => (
                    <div key={author.author} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">#{index + 1}</span>
                        <span>{author.author}</span>
                      </div>
                      <span className="font-semibold">{author.count} knih</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <MobileNav onAddClick={() => router.push('/')} />
      </main>
    </div>
  )
}
