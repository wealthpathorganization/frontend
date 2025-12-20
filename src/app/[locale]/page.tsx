"use client"

export const dynamic = 'force-dynamic'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { WebApplicationJsonLd, OrganizationJsonLd } from "@/components/seo/json-ld"
import {
  TrendingUp,
  ArrowRight,
  PiggyBank,
  Target,
  CreditCard,
  BarChart3,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('landing')
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push(`/${locale}/dashboard`)
    }
  }, [isAuthenticated, router, locale])

  const features = [
    {
      icon: BarChart3,
      title: t('features.tracking.title'),
      description: t('features.tracking.description'),
    },
    {
      icon: PiggyBank,
      title: t('features.budgeting.title'),
      description: t('features.budgeting.description'),
    },
    {
      icon: Target,
      title: t('features.savings.title'),
      description: t('features.savings.description'),
    },
    {
      icon: CreditCard,
      title: t('features.debt.title'),
      description: t('features.debt.description'),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <WebApplicationJsonLd locale={locale} />
      <OrganizationJsonLd />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MzljOWUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2NGgtNHpNNDAgMzBoNHY0aC00ek00NCAyNmg0djRoLTR6TTQ4IDIyaDR2NGgtNHpNNTIgMThoNHY0aC00ek01NiAxNGg0djRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-20 pb-16 sm:pb-24">
          <nav className="flex items-center justify-between mb-8 sm:mb-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl sm:text-2xl">WealthPath</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href={`/${locale}/login`}>
                <Button variant="ghost" size="sm" className="sm:size-default">{t('signIn')}</Button>
              </Link>
              <Link href={`/${locale}/register`} className="hidden sm:block">
                <Button>{t('getStarted')}</Button>
              </Link>
            </div>
          </nav>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-4 sm:mb-6 animate-fade-in">
              {t('hero.title')}{" "}
              <span className="gradient-text">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-10 max-w-2xl mx-auto animate-fade-in px-2" style={{ animationDelay: "100ms" }}>
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <Link href={`/${locale}/register`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
                  {t('startFree')}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Link href={`/${locale}/login`} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8">
                  {t('signIn')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4 px-2">
              {t('featuresSection.title')}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              {t('featuresSection.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-4 sm:p-6 bg-card rounded-2xl border hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl gradient-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-6 sm:p-12 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto">
              {t('cta.description')}
            </p>
            <Link href={`/${locale}/register`}>
              <Button size="lg" className="text-base sm:text-lg px-6 sm:px-10">
                {t('cta.button')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold">WealthPath</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} WealthPath. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}



