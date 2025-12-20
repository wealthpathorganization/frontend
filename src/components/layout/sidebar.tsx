"use client"

import {
  ArrowUpDown,
  Building2,
  Calculator,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  RefreshCw,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useLocale, useTranslations } from 'next-intl'

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth"
import { usePathname } from "next/navigation"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations()
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)

  const navigation = [
    { name: t('dashboard.title'), href: `/${locale}/dashboard`, icon: LayoutDashboard, key: 'dashboard' },
    { name: t('transactions.title'), href: `/${locale}/transactions`, icon: ArrowUpDown, key: 'transactions' },
    { name: t('recurring.title'), href: `/${locale}/recurring`, icon: RefreshCw, key: 'recurring' },
    { name: t('budgets.title'), href: `/${locale}/budgets`, icon: PiggyBank, key: 'budgets' },
    { name: t('savings.title'), href: `/${locale}/savings`, icon: Target, key: 'savings' },
    { name: t('debts.title'), href: `/${locale}/debts`, icon: CreditCard, key: 'debts' },
    { name: t('rates.title'), href: `/${locale}/rates`, icon: Building2, key: 'rates' },
    { name: t('calculator.title'), href: `/${locale}/calculator`, icon: Calculator, key: 'calculator' },
  ]

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl gradient-text">WealthPath</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t space-y-3">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="px-2">
          <LanguageSwitcher />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1" asChild>
            <Link href={`/${locale}/settings`} onClick={() => setOpen(false)}>
              <Settings className="w-4 h-4 mr-2" />
              {t('settings.title')}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">WealthPath</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 flex flex-col">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}
