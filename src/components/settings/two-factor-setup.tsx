"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Shield, ShieldCheck, ShieldOff, Copy, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { api, TOTPSetupResponse } from "@/lib/api"
import { useAuthStore } from "@/store/auth"

export function TwoFactorSetup() {
  const t = useTranslations('twoFactor')
  const tCommon = useTranslations('common')
  const { user, setUser } = useAuthStore()
  const { toast } = useToast()

  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [backupCodesDialogOpen, setBackupCodesDialogOpen] = useState(false)
  const [setupData, setSetupData] = useState<TOTPSetupResponse | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [showManualEntry, setShowManualEntry] = useState(false)

  const setupMutation = useMutation({
    mutationFn: () => api.setup2FA(),
    onSuccess: (data) => {
      setSetupData(data)
      setSetupDialogOpen(true)
    },
    onError: () => {
      toast({
        title: tCommon('error'),
        description: "Failed to set up 2FA",
        variant: "destructive",
      })
    },
  })

  const verifyMutation = useMutation({
    mutationFn: (code: string) => api.verify2FA(code),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes)
      setSetupDialogOpen(false)
      setBackupCodesDialogOpen(true)
      setVerificationCode("")
      // Update user state to reflect 2FA enabled
      if (user) {
        setUser({ ...user, totpEnabled: true })
      }
      toast({
        title: tCommon('success'),
        description: t('setupSuccess'),
      })
    },
    onError: () => {
      toast({
        title: tCommon('error'),
        description: t('invalidCode'),
        variant: "destructive",
      })
    },
  })

  const disableMutation = useMutation({
    mutationFn: (code: string) => api.disable2FA(code),
    onSuccess: () => {
      setDisableDialogOpen(false)
      setDisableCode("")
      // Update user state to reflect 2FA disabled
      if (user) {
        setUser({ ...user, totpEnabled: false })
      }
      toast({
        title: tCommon('success'),
        description: t('disableSuccess'),
      })
    },
    onError: () => {
      toast({
        title: tCommon('error'),
        description: t('invalidCode'),
        variant: "destructive",
      })
    },
  })

  const handleVerify = () => {
    if (!verificationCode) {
      toast({
        title: tCommon('error'),
        description: t('codeRequired'),
        variant: "destructive",
      })
      return
    }
    verifyMutation.mutate(verificationCode)
  }

  const handleDisable = () => {
    if (!disableCode) {
      toast({
        title: tCommon('error'),
        description: t('codeRequired'),
        variant: "destructive",
      })
      return
    }
    disableMutation.mutate(disableCode)
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n")
    navigator.clipboard.writeText(codesText)
    toast({
      title: tCommon('success'),
      description: t('backupCodesCopied'),
    })
  }

  const is2FAEnabled = user?.totpEnabled ?? false

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('title')}
          </CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {is2FAEnabled ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {t('enabled')}
                  </span>
                </>
              ) : (
                <>
                  <ShieldOff className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('disabled')}</span>
                </>
              )}
            </div>
            {is2FAEnabled ? (
              <Button
                variant="destructive"
                onClick={() => setDisableDialogOpen(true)}
              >
                {t('disable')}
              </Button>
            ) : (
              <Button
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending}
              >
                {setupMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t('setup')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('setupTitle')}</DialogTitle>
            <DialogDescription>{t('setupDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {setupData && (
              <>
                {!showManualEntry ? (
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-sm font-medium">{t('scanQR')}</p>
                    <div className="bg-white p-4 rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={setupData.qrCodeUrl}
                        alt="QR Code"
                        width={200}
                        height={200}
                      />
                    </div>
                    <Button
                      variant="link"
                      onClick={() => setShowManualEntry(true)}
                    >
                      {t('manualEntry')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-medium">{t('manualEntry')}</p>
                    <div className="space-y-2">
                      <Label>{t('secretKey')}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={setupData.secret}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(setupData.secret)
                            toast({
                              title: tCommon('success'),
                              description: "Secret key copied",
                            })
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      onClick={() => setShowManualEntry(false)}
                    >
                      {t('scanQR')}
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label>{t('verifyCode')}</Label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">{t('enterCode')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSetupDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleVerify}
              disabled={verifyMutation.isPending || verificationCode.length !== 6}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('verifying')}
                </>
              ) : (
                t('verify')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={backupCodesDialogOpen} onOpenChange={setBackupCodesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('backupCodesTitle')}</DialogTitle>
            <DialogDescription>{t('backupCodesDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4 grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="text-sm font-mono bg-background p-2 rounded text-center"
                >
                  {code}
                </code>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={copyBackupCodes}>
              <Copy className="w-4 h-4 mr-2" />
              {t('copyBackupCodes')}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setBackupCodesDialogOpen(false)}>
              {t('done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('disableTitle')}</DialogTitle>
            <DialogDescription>{t('disableDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t('verifyCode')}</Label>
            <Input
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="font-mono text-center text-lg tracking-widest"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disableMutation.isPending || disableCode.length !== 6}
            >
              {disableMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('disabling')}
                </>
              ) : (
                t('disable')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
