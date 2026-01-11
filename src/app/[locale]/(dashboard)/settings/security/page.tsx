"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Loader2, LogOut, Monitor, Shield, Smartphone, Tablet, Trash2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api, Session } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { useToast } from "@/components/ui/use-toast"

function getDeviceIcon(deviceType?: string) {
  switch (deviceType?.toLowerCase()) {
    case "mobile":
      return Smartphone
    case "tablet":
      return Tablet
    case "desktop":
      return Monitor
    default:
      return Laptop
  }
}

function formatDeviceInfo(session: Session): string {
  const parts: string[] = []
  if (session.deviceInfo?.browser) {
    parts.push(session.deviceInfo.browser)
  }
  if (session.deviceInfo?.os) {
    parts.push(session.deviceInfo.os)
  }
  return parts.length > 0 ? parts.join(" on ") : "Unknown device"
}

export default function SecuritySettingsPage() {
  const t = useTranslations()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { logout: authLogout } = useAuthStore()
  const { toast } = useToast()

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.getSessions(),
  })

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => api.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
      toast({
        title: t("security.sessionRevoked"),
        description: t("security.sessionRevokedDescription"),
      })
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("security.revokeError"),
        variant: "destructive",
      })
    },
  })

  const revokeAllMutation = useMutation({
    mutationFn: () => api.revokeAllSessions(),
    onSuccess: async () => {
      toast({
        title: t("security.allSessionsRevoked"),
        description: t("security.allSessionsRevokedDescription"),
      })
      // Sign out locally since all sessions are revoked
      await authLogout()
      router.push("/login")
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("security.revokeAllError"),
        variant: "destructive",
      })
    },
  })

  const handleRevokeSession = (sessionId: string, isCurrent: boolean) => {
    if (isCurrent) {
      // Revoking current session means logging out
      authLogout()
      router.push("/login")
      return
    }
    revokeMutation.mutate(sessionId)
  }

  const handleSignOutEverywhere = () => {
    revokeAllMutation.mutate()
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold">{t("security.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("security.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("security.activeSessions")}
          </CardTitle>
          <CardDescription>{t("security.activeSessionsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("security.loadError")}
            </p>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceInfo?.deviceType)
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <DeviceIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{formatDeviceInfo(session)}</p>
                          {session.isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              {t("security.currentSession")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t("security.lastActive")}{" "}
                          {formatDistanceToNow(new Date(session.lastUsedAt), { addSuffix: true })}
                        </p>
                        {session.ipAddress && (
                          <p className="text-xs text-muted-foreground">
                            IP: {session.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={session.isCurrent ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleRevokeSession(session.id, session.isCurrent)}
                      disabled={revokeMutation.isPending}
                    >
                      {revokeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : session.isCurrent ? (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          {t("auth.logout")}
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("security.revoke")}
                        </>
                      )}
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("security.noSessions")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="w-5 h-5" />
            {t("security.signOutEverywhere")}
          </CardTitle>
          <CardDescription>{t("security.signOutEverywhereDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleSignOutEverywhere}
            disabled={revokeAllMutation.isPending}
          >
            {revokeAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {t("security.signOutAllDevices")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
