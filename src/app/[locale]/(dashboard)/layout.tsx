"use client"

export const dynamic = 'force-dynamic'

import { AIChat } from "@/components/chat/ai-chat"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuthStore } from "@/store/auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const locale = useLocale()
  const { isAuthenticated, isInitialized } = useAuthStore()

  useEffect(() => {
    // Only redirect after auth is initialized
    if (isInitialized && !isAuthenticated) {
      router.push(`/${locale}/login`)
    }
  }, [isAuthenticated, isInitialized, router, locale])

  // Wait for auth initialization before rendering
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* pt-16 on mobile for fixed header, lg:pt-0 lg:pl-64 for desktop sidebar */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
      <AIChat />
    </div>
  )
}


