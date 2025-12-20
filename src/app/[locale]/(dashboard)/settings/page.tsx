"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Loader2, LogOut, Save, User } from "lucide-react"
import { SUPPORTED_CURRENCIES, api } from "@/lib/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations()
  const { user, setUser, logout } = useAuthStore()
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || "")
  const [currency, setCurrency] = useState(user?.currency || "USD")

  const updateMutation = useMutation({
    mutationFn: () => api.updateSettings({ name, currency }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast({
        title: t('settings.settingsSaved'),
        description: t('settings.settingsSavedDescription'),
      })
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('settings.saveError'),
        variant: "destructive",
      })
    },
  })

  const hasChanges = name !== user?.name || currency !== user?.currency

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('settings.account')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('settings.profile')}
          </CardTitle>
          <CardDescription>{t('settings.account')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth.name')}</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.name')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input id="email" type="email" defaultValue={user?.email} disabled />
            <p className="text-xs text-muted-foreground">{t('settings.emailCannotBeChanged')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t('settings.preferences')}
          </CardTitle>
          <CardDescription>{t('settings.preferences')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">{t('settings.defaultCurrency')}</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.defaultCurrency')} />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono w-6">{c.symbol}</span>
                      <span>{c.code}</span>
                      <span className="text-muted-foreground">- {c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t('settings.currencyDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button 
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {t('settings.saveChanges')}
          </Button>
        </div>
      )}

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="w-5 h-5" />
            {t('auth.logout')}
          </CardTitle>
          <CardDescription>{t('auth.logout')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            {t('auth.logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
