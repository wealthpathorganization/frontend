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
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login`)
    }
  }, [isAuthenticated, router, locale])

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


