"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionFilters as Filters, DATE_PRESETS, DatePreset } from "@/lib/api"
import { Search, Filter, X, ChevronDown } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

const EXPENSE_CATEGORIES = [
  "Housing", "Transportation", "Food & Dining", "Utilities", "Healthcare",
  "Insurance", "Entertainment", "Shopping", "Personal Care", "Education",
  "Travel", "Gifts & Donations", "Investments", "Debt Payments", "Other",
]

const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Business", "Investments", "Rental", "Gifts", "Refunds", "Other",
]

const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]))

interface TransactionFiltersProps {
  onFiltersChange: (filters: Filters) => void
  initialFilters?: Filters
}

export function TransactionFiltersComponent({ onFiltersChange, initialFilters }: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State
  const [search, setSearch] = useState(initialFilters?.search || "")
  const [minAmount, setMinAmount] = useState(initialFilters?.minAmount || "")
  const [maxAmount, setMaxAmount] = useState(initialFilters?.maxAmount || "")
  const [datePreset, setDatePreset] = useState<DatePreset | "all-time">(
    (initialFilters?.datePreset as DatePreset) || "all-time"
  )
  const [startDate, setStartDate] = useState(initialFilters?.startDate || "")
  const [endDate, setEndDate] = useState(initialFilters?.endDate || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters?.categories ? initialFilters.categories.split(",") : []
  )
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Debounce search
  const debouncedSearch = useDebounce(search, 300)

  // Count active filters
  const activeFilterCount = [
    debouncedSearch,
    minAmount,
    maxAmount,
    datePreset && datePreset !== "all-time",
    selectedCategories.length > 0,
  ].filter(Boolean).length

  // Update URL and call onFiltersChange
  const updateFilters = useCallback(() => {
    const filters: Filters = {}

    if (debouncedSearch) filters.search = debouncedSearch
    if (minAmount) filters.minAmount = minAmount
    if (maxAmount) filters.maxAmount = maxAmount
    if (datePreset && datePreset !== "custom" && datePreset !== "all-time") {
      filters.datePreset = datePreset
    } else if (datePreset === "custom") {
      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate
    }
    if (selectedCategories.length > 0) {
      filters.categories = selectedCategories.join(",")
    }

    // Update URL params
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl, { scroll: false })

    onFiltersChange(filters)
  }, [debouncedSearch, minAmount, maxAmount, datePreset, startDate, endDate, selectedCategories, pathname, router, onFiltersChange])

  // Effect to trigger filter update
  useEffect(() => {
    updateFilters()
  }, [updateFilters])

  // Load filters from URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get("search")
    const urlMinAmount = searchParams.get("minAmount")
    const urlMaxAmount = searchParams.get("maxAmount")
    const urlDatePreset = searchParams.get("datePreset")
    const urlStartDate = searchParams.get("startDate")
    const urlEndDate = searchParams.get("endDate")
    const urlCategories = searchParams.get("categories")

    if (urlSearch) setSearch(urlSearch)
    if (urlMinAmount) setMinAmount(urlMinAmount)
    if (urlMaxAmount) setMaxAmount(urlMaxAmount)
    if (urlDatePreset) setDatePreset(urlDatePreset as DatePreset)
    if (urlStartDate) setStartDate(urlStartDate)
    if (urlEndDate) setEndDate(urlEndDate)
    if (urlCategories) setSelectedCategories(urlCategories.split(","))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear all filters
  const clearFilters = () => {
    setSearch("")
    setMinAmount("")
    setMaxAmount("")
    setDatePreset("all-time")
    setStartDate("")
    setEndDate("")
    setSelectedCategories([])
  }

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Date Preset Dropdown */}
        <Select
          value={datePreset}
          onValueChange={(value) => setDatePreset(value as DatePreset)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-time">All time</SelectItem>
            {DATE_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* More Filters Button */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>

              {/* Amount Range */}
              <div className="space-y-2">
                <Label>Amount Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="flex-1"
                  />
                  <span className="flex items-center text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Custom Date Range (only if datePreset is "custom") */}
              {datePreset === "custom" && (
                <div className="space-y-2">
                  <Label>Custom Date Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
                  {ALL_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <label
                        htmlFor={category}
                        className="text-sm cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedCategories.length} selected
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {debouncedSearch && (
            <FilterTag
              label={`Search: "${debouncedSearch}"`}
              onRemove={() => setSearch("")}
            />
          )}
          {(minAmount || maxAmount) && (
            <FilterTag
              label={`Amount: ${minAmount || "0"} - ${maxAmount || "∞"}`}
              onRemove={() => {
                setMinAmount("")
                setMaxAmount("")
              }}
            />
          )}
          {datePreset && datePreset !== "custom" && datePreset !== "all-time" && (
            <FilterTag
              label={DATE_PRESETS.find((p) => p.value === datePreset)?.label || datePreset}
              onRemove={() => setDatePreset("all-time")}
            />
          )}
          {datePreset === "custom" && (startDate || endDate) && (
            <FilterTag
              label={`${startDate || "..."} to ${endDate || "..."}`}
              onRemove={() => {
                setDatePreset("all-time")
                setStartDate("")
                setEndDate("")
              }}
            />
          )}
          {selectedCategories.map((cat) => (
            <FilterTag
              key={cat}
              label={cat}
              onRemove={() => toggleCategory(cat)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-muted-foreground/20 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
