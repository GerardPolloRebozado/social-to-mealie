"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Option } from "@/lib/types"

interface MultiSelectProps {
  options: Option[]
  selected?: string[]
  onChange?: (selected: string[]) => void
  placeholder?: string
  className?: string
  paramName?: string
}

export function MultiSelectCombobox({
  options,
  selected: controlledSelected,
  onChange,
  placeholder = "Select items...",
  className,
  paramName,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selected = React.useMemo(() => {
    if (paramName) {
      return searchParams.get(paramName)?.split(",").filter(Boolean) ?? []
    }
    return controlledSelected ?? []
  }, [paramName, searchParams, controlledSelected])

  const updateSelection = (newSelected: string[]) => {
    if (paramName) {
      const params = new URLSearchParams(searchParams.toString())
      if (newSelected.length > 0) {
        params.set(paramName, newSelected.join(","))
      } else {
        params.delete(paramName)
      }
      router.replace(`${pathname}?${params.toString()}`)
    }

    onChange?.(newSelected)
  }

  const handleUnselect = (item: string) => {
    updateSelection(selected.filter((i) => i !== item))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10", className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.map((item) => (
              <Badge variant="secondary" key={item} className="mr-1 mb-1">
                {options.find((option) => option.value === item)?.label}
                <div
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(item)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleUnselect(item)
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </div>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    updateSelection(
                      selected.includes(option.value)
                        ? selected.filter((item) => item !== option.value)
                        : [...selected, option.value]
                    )
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
