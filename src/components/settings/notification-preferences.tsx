"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { api, UpdateNotificationPreferencesInput } from "@/lib/api"
import {
  isPushSupported,
  getPermissionStatus,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  registerServiceWorker,
} from "@/lib/push-notifications"

export function NotificationPreferences() {
  const t = useTranslations("notifications")
  const tCommon = useTranslations("common")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [isSupported, setIsSupported] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  // Check push support and status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const supported = isPushSupported()
      setIsSupported(supported)

      if (supported) {
        setPermissionStatus(getPermissionStatus())
        const subscribed = await isSubscribedToPush()
        setIsSubscribed(subscribed)

        // Register service worker
        await registerServiceWorker()
      }
    }
    checkStatus()
  }, [])

  // Fetch notification preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notificationPreferences"],
    queryFn: () => api.getNotificationPreferences(),
    enabled: isSubscribed,
  })

  // Update preferences mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateNotificationPreferencesInput) => api.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] })
      toast({
        title: tCommon("success"),
        description: t("preferencesSaved"),
      })
    },
    onError: () => {
      toast({
        title: tCommon("error"),
        description: t("preferencesSaveError"),
        variant: "destructive",
      })
    },
  })

  const handleToggleNotifications = async () => {
    setIsToggling(true)
    try {
      if (isSubscribed) {
        await unsubscribeFromPush()
        setIsSubscribed(false)
        toast({
          title: tCommon("success"),
          description: t("unsubscribed"),
        })
      } else {
        await subscribeToPush()
        setIsSubscribed(true)
        setPermissionStatus("granted")
        toast({
          title: tCommon("success"),
          description: t("subscribed"),
        })
      }
    } catch (error) {
      toast({
        title: tCommon("error"),
        description: error instanceof Error ? error.message : t("toggleError"),
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  const handlePreferenceChange = (key: keyof UpdateNotificationPreferencesInput, value: boolean | number) => {
    updateMutation.mutate({ [key]: value })
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-muted-foreground" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("notSupported")}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("enableNotifications")}</Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed ? t("enabled") : t("disabled")}
            </p>
          </div>
          <Button
            variant={isSubscribed ? "destructive" : "default"}
            onClick={handleToggleNotifications}
            disabled={isToggling || permissionStatus === "denied"}
          >
            {isToggling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubscribed ? t("disable") : t("enable")}
          </Button>
        </div>

        {permissionStatus === "denied" && (
          <p className="text-sm text-destructive">{t("permissionDenied")}</p>
        )}

        {/* Preferences (only shown when subscribed) */}
        {isSubscribed && !isLoading && preferences && (
          <div className="space-y-4 pt-4 border-t">
            {/* Bill Reminders */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("billReminders")}</Label>
                <p className="text-sm text-muted-foreground">{t("billRemindersDescription")}</p>
              </div>
              <Switch
                checked={preferences.billRemindersEnabled}
                onCheckedChange={(checked) => handlePreferenceChange("billRemindersEnabled", checked)}
              />
            </div>

            {preferences.billRemindersEnabled && (
              <div className="ml-4 space-y-2">
                <Label className="text-sm">
                  {t("daysBefore")}: {preferences.billReminderDaysBefore}
                </Label>
                <Slider
                  value={[preferences.billReminderDaysBefore]}
                  onValueChange={([value]) => handlePreferenceChange("billReminderDaysBefore", value)}
                  min={1}
                  max={7}
                  step={1}
                  className="w-48"
                />
              </div>
            )}

            {/* Budget Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("budgetAlerts")}</Label>
                <p className="text-sm text-muted-foreground">{t("budgetAlertsDescription")}</p>
              </div>
              <Switch
                checked={preferences.budgetAlertsEnabled}
                onCheckedChange={(checked) => handlePreferenceChange("budgetAlertsEnabled", checked)}
              />
            </div>

            {preferences.budgetAlertsEnabled && (
              <div className="ml-4 space-y-2">
                <Label className="text-sm">
                  {t("alertThreshold")}: {preferences.budgetAlertThreshold}%
                </Label>
                <Slider
                  value={[preferences.budgetAlertThreshold]}
                  onValueChange={([value]) => handlePreferenceChange("budgetAlertThreshold", value)}
                  min={50}
                  max={100}
                  step={5}
                  className="w-48"
                />
              </div>
            )}

            {/* Goal Milestones */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("goalMilestones")}</Label>
                <p className="text-sm text-muted-foreground">{t("goalMilestonesDescription")}</p>
              </div>
              <Switch
                checked={preferences.goalMilestonesEnabled}
                onCheckedChange={(checked) => handlePreferenceChange("goalMilestonesEnabled", checked)}
              />
            </div>

            {/* Weekly Summary */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("weeklySummary")}</Label>
                <p className="text-sm text-muted-foreground">{t("weeklySummaryDescription")}</p>
              </div>
              <Switch
                checked={preferences.weeklySummaryEnabled}
                onCheckedChange={(checked) => handlePreferenceChange("weeklySummaryEnabled", checked)}
              />
            </div>
          </div>
        )}

        {isSubscribed && isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
