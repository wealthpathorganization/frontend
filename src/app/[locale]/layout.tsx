import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { locales, type Locale } from '@/i18n'
import { Providers } from '@/components/providers'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import '../globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://wealthpath.duckdns.org'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ 
  params: { locale } 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  const isVi = locale === 'vi'
  
  const title = isVi 
    ? 'WealthPath - Quản lý tài chính cá nhân' 
    : 'WealthPath - Personal Finance Manager'
  
  const description = isVi 
    ? 'Theo dõi chi tiêu, quản lý ngân sách, đặt mục tiêu tiết kiệm và quản lý nợ. WealthPath giúp bạn kiểm soát tài chính cá nhân.'
    : 'Track expenses, manage budgets, set savings goals, and manage debt. WealthPath helps you take control of your personal finances.'

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: title,
      template: `%s | WealthPath`
    },
    description,
    keywords: isVi 
      ? ['quản lý tài chính', 'theo dõi chi tiêu', 'ngân sách', 'tiết kiệm', 'quản lý nợ', 'tài chính cá nhân']
      : ['finance management', 'expense tracker', 'budget', 'savings', 'debt management', 'personal finance'],
    authors: [{ name: 'WealthPath Team' }],
    creator: 'WealthPath',
    publisher: 'WealthPath',
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      siteName: 'WealthPath',
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'WealthPath - Personal Finance Manager',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/og-image.png`],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'en': `${BASE_URL}/en`,
        'vi': `${BASE_URL}/vi`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Hardcoded for reliability - env var can override if needed
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'hmaoUIUVvl1QGRo_Oj_hRbSWzAjI5Por_V4QAfEC9ZM',
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen">
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

