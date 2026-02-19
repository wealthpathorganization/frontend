"use client"

import { useState, useCallback, Suspense } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, Transaction, CreateTransactionInput, TransactionFilters } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { useCurrency } from "@/hooks/use-currency"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/currency-input"
import { useAuthStore } from "@/store/auth"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "next-intl"
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Pencil,
  Loader2,
  Receipt,
  Download,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TransactionFiltersComponent } from "@/components/transactions/transaction-filters"

const EXPENSE_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food & Dining",
  "Utilities",
  "Healthcare",
  "Insurance",
  "Entertainment",
  "Shopping",
  "Personal Care",
  "Education",
  "Travel",
  "Gifts & Donations",
  "Investments",
  "Debt Payments",
  "Other",
]

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Rental",
  "Gifts",
  "Refunds",
  "Other",
]

export default function TransactionsPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [editType, setEditType] = useState<"income" | "expense">("expense")
  const [editAmount, setEditAmount] = useState("")
  const [filters, setFilters] = useState<TransactionFilters>({ pageSize: "50" })
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const t = useTranslations()
  const { user } = useAuthStore()
  const currency = user?.currency || "USD"

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const { blob, filename } = await api.exportTransactionsCSV(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({ title: t("common.success"), description: t("export.csvExported") })
    } catch {
      toast({
        title: t("common.error"),
        description: t("export.exportFailed"),
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFiltersChange = useCallback((newFilters: TransactionFilters) => {
    setFilters({ ...newFilters, pageSize: "50" })
  }, [])

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions", filters],
    queryFn: () => api.getTransactions(filters),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionInput) => api.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"], refetchType: "all" })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      setIsOpen(false)
      toast({ title: t('transactions.transactionAdded'), variant: "default" })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add transaction",
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"], refetchType: "all" })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      toast({ title: t('transactions.transactionDeleted') })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTransactionInput }) =>
      api.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"], refetchType: "all" })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      setIsEditOpen(false)
      setEditingTransaction(null)
      toast({ title: t('transactions.transactionUpdated'), variant: "default" })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update transaction",
        variant: "destructive",
      })
    },
  })

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx)
    setEditType(tx.type as "income" | "expense")
    setEditAmount(String(tx.amount))
    setIsEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTransaction) return
    const formData = new FormData(e.currentTarget)
    updateMutation.mutate({
      id: editingTransaction.id,
      data: {
        type: editType,
        amount: parseFloat(editAmount.replace(/,/g, "")),
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        date: formData.get("date") as string,
      },
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createMutation.mutate({
      type,
      amount: parseFloat(amount.replace(/,/g, "")),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    })
    setAmount("") // Reset after submit
  }

  const incomeTransactions = transactions?.filter((t) => t.type === "income") || []
  const expenseTransactions = transactions?.filter((t) => t.type === "expense") || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">{t('transactions.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('transactions.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {t("export.export")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                {t("export.exportCSV")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('transactions.addTransaction')}
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('transactions.addTransaction')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("expense")}
                >
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  {t('transactions.expense')}
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("income")}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {t('transactions.income')}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('transactions.amount')}</Label>
                <CurrencyInput
                  id="amount"
                  value={amount}
                  onChange={setAmount}
                  currency={currency}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('transactions.category')}</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('transactions.descriptionOptional')}</Label>
                <Input id="description" name="description" placeholder={t('transactions.addNote')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t('transactions.date')}</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('common.adding')}
                  </>
                ) : (
                  t('transactions.addTransaction')
                )}
              </Button>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-12 bg-muted animate-pulse rounded-lg" />}>
        <TransactionFiltersComponent
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />
      </Suspense>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{t('common.all')} ({transactions?.length || 0})</TabsTrigger>
          <TabsTrigger value="income">{t('transactions.income')} ({incomeTransactions.length})</TabsTrigger>
          <TabsTrigger value="expenses">{t('transactions.expenses')} ({expenseTransactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <TransactionList
            transactions={transactions || []}
            isLoading={isLoading}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={handleEdit}
            t={t}
          />
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <TransactionList
            transactions={incomeTransactions}
            isLoading={isLoading}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={handleEdit}
            t={t}
          />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <TransactionList
            transactions={expenseTransactions}
            isLoading={isLoading}
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={handleEdit}
            t={t}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditingTransaction(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('transactions.editTransaction')}</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editType === "expense" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setEditType("expense")}
                >
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  {t('transactions.expense')}
                </Button>
                <Button
                  type="button"
                  variant={editType === "income" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setEditType("income")}
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {t('transactions.income')}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">{t('transactions.amount')}</Label>
                <CurrencyInput
                  id="edit-amount"
                  value={editAmount}
                  onChange={setEditAmount}
                  currency={currency}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">{t('transactions.category')}</Label>
                <Select name="category" defaultValue={editingTransaction.category} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(editType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">{t('transactions.descriptionOptional')}</Label>
                <Input
                  id="edit-description"
                  name="description"
                  placeholder={t('transactions.addNote')}
                  defaultValue={editingTransaction.description || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date">{t('transactions.date')}</Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  defaultValue={editingTransaction.date?.split("T")[0]}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('common.saveChanges')
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TransactionList({
  transactions,
  isLoading,
  onDelete,
  onEdit,
  t,
}: {
  transactions: Transaction[]
  isLoading: boolean
  onDelete: (id: string) => void
  onEdit: (tx: Transaction) => void
  t: ReturnType<typeof useTranslations>
}) {
  const { formatCurrency } = useCurrency()
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">{t('transactions.noTransactions')}</p>
              <p className="text-sm text-muted-foreground">{t('transactions.noTransactionsDescription')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group by date
  const grouped = transactions.reduce((acc, tx) => {
    const date = tx.date.split("T")[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(tx)
    return acc
  }, {} as Record<string, Transaction[]>)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {formatDate(date)}
          </h3>
          <Card>
            <CardContent className="p-0 divide-y">
              {txs.map((tx) => {
                const isIncome = tx.type === "income"
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isIncome ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.category}</p>
                        {tx.description && (
                          <p className="text-sm text-muted-foreground">{tx.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-lg font-semibold ${
                          isIncome ? "text-success" : "text-destructive"
                        }`}
                      >
                        {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => onEdit(tx)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(tx.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}



