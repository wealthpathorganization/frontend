'use client'

import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Monitor, Download, CheckCircle, Shield, Wifi, WifiOff } from 'lucide-react'

export default function DownloadPage() {
  const locale = useLocale()

  const features = [
    {
      icon: Shield,
      title: locale === 'vi' ? 'Bảo mật cao' : 'Secure',
      description: locale === 'vi'
        ? 'Xác thực sinh trắc học & mã hóa dữ liệu'
        : 'Biometric auth & encrypted data'
    },
    {
      icon: WifiOff,
      title: locale === 'vi' ? 'Hoạt động offline' : 'Works Offline',
      description: locale === 'vi'
        ? 'Truy cập dữ liệu mọi lúc, mọi nơi'
        : 'Access your data anytime, anywhere'
    },
    {
      icon: Wifi,
      title: locale === 'vi' ? 'Đồng bộ tự động' : 'Auto Sync',
      description: locale === 'vi'
        ? 'Dữ liệu đồng bộ khi có mạng'
        : 'Data syncs when online'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'vi' ? 'Tải WealthPath' : 'Download WealthPath'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {locale === 'vi'
              ? 'Quản lý tài chính cá nhân thông minh trên mọi thiết bị'
              : 'Smart personal finance management on all your devices'}
          </p>
        </div>

        {/* Download Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Android APK */}
          <Card className="border-2 hover:border-emerald-500 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl">Android</CardTitle>
              <CardDescription>
                {locale === 'vi' ? 'Tải file APK trực tiếp' : 'Direct APK download'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                asChild
              >
                <a href="/downloads/wealthpath-v1.0.0.apk" download>
                  <Download className="w-5 h-5 mr-2" />
                  {locale === 'vi' ? 'Tải APK (v1.0.0)' : 'Download APK (v1.0.0)'}
                </a>
              </Button>
              <p className="text-sm text-gray-500">
                {locale === 'vi'
                  ? 'Yêu cầu Android 6.0 trở lên'
                  : 'Requires Android 6.0 or higher'}
              </p>

              {/* Installation Instructions */}
              <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-2">
                  {locale === 'vi' ? 'Hướng dẫn cài đặt:' : 'Installation:'}
                </h4>
                <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <li>1. {locale === 'vi' ? 'Tải file APK' : 'Download the APK file'}</li>
                  <li>2. {locale === 'vi' ? 'Mở file đã tải' : 'Open the downloaded file'}</li>
                  <li>3. {locale === 'vi' ? 'Cho phép cài đặt từ nguồn không xác định' : 'Allow installation from unknown sources'}</li>
                  <li>4. {locale === 'vi' ? 'Cài đặt và mở ứng dụng' : 'Install and open the app'}</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* iOS / Web PWA */}
          <Card className="border-2 hover:border-emerald-500 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">iOS & Web</CardTitle>
              <CardDescription>
                {locale === 'vi' ? 'Cài đặt Web App (PWA)' : 'Install as Web App (PWA)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button
                size="lg"
                className="w-full"
                variant="outline"
                asChild
              >
                <Link href={`/${locale}/dashboard`}>
                  {locale === 'vi' ? 'Mở Web App' : 'Open Web App'}
                </Link>
              </Button>
              <p className="text-sm text-gray-500">
                {locale === 'vi'
                  ? 'Hoạt động trên mọi trình duyệt'
                  : 'Works on any modern browser'}
              </p>

              {/* PWA Installation Instructions */}
              <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-2">
                  {locale === 'vi' ? 'Cài đặt trên iOS:' : 'Install on iOS:'}
                </h4>
                <ol className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                  <li>1. {locale === 'vi' ? 'Mở trong Safari' : 'Open in Safari'}</li>
                  <li>2. {locale === 'vi' ? 'Nhấn nút Chia sẻ' : 'Tap the Share button'}</li>
                  <li>3. {locale === 'vi' ? 'Chọn "Thêm vào Màn hình chính"' : 'Select "Add to Home Screen"'}</li>
                  <li>4. {locale === 'vi' ? 'Nhấn "Thêm"' : 'Tap "Add"'}</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            {locale === 'vi' ? 'Tính năng nổi bật' : 'Key Features'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
              >
                <feature.icon className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* App Features List */}
        <div className="max-w-2xl mx-auto mt-12">
          <h3 className="text-xl font-semibold text-center mb-6">
            {locale === 'vi' ? 'Tất cả tính năng' : 'All Features'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              locale === 'vi' ? 'Theo dõi giao dịch' : 'Transaction tracking',
              locale === 'vi' ? 'Quản lý ngân sách' : 'Budget management',
              locale === 'vi' ? 'Mục tiêu tiết kiệm' : 'Savings goals',
              locale === 'vi' ? 'Quản lý nợ' : 'Debt tracking',
              locale === 'vi' ? 'Giao dịch định kỳ' : 'Recurring transactions',
              locale === 'vi' ? 'So sánh lãi suất' : 'Interest rate comparison',
              locale === 'vi' ? 'Trợ lý AI' : 'AI assistant',
              locale === 'vi' ? 'Thông báo đẩy' : 'Push notifications',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>
            {locale === 'vi'
              ? 'Câu hỏi? Liên hệ support@wealthpath.app'
              : 'Questions? Contact support@wealthpath.app'}
          </p>
        </div>
      </div>
    </div>
  )
}
