"use client"

import { useState } from "react"
import { 
  ChevronDown, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Pencil,
  Check,
  X,
  Vault
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { Vault as VaultType } from "@/hooks/use-vaults"

interface VaultSelectorProps {
  vaults: VaultType[]
  activeVault: VaultType | null
  onSelectVault: (id: string) => void
  onAddVault: () => void
  onRenameVault: (id: string, name: string) => void
  onRemoveVault: (id: string) => void
  disabled?: boolean
}

export function VaultSelector({
  vaults,
  activeVault,
  onSelectVault,
  onAddVault,
  onRenameVault,
  onRemoveVault,
  disabled,
}: VaultSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const handleStartEdit = (vault: VaultType, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(vault.id)
    setEditName(vault.name)
  }

  const handleSaveEdit = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (editName.trim()) {
      onRenameVault(id, editName.trim())
    }
    setEditingId(null)
    setEditName("")
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(null)
    setEditName("")
  }

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemoveVault(id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between px-3 h-auto py-2"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Vault className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {activeVault ? activeVault.name : "Select Vault"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {vaults.length > 0 && (
          <>
            {vaults.map((vault) => (
              <DropdownMenuItem
                key={vault.id}
                className="flex items-center justify-between gap-2 cursor-pointer"
                onSelect={() => {
                  if (editingId !== vault.id) {
                    onSelectVault(vault.id)
                  }
                }}
              >
                {editingId === vault.id ? (
                  <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(vault.id, e as any)
                        } else if (e.key === 'Escape') {
                          handleCancelEdit(e as any)
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={(e) => handleSaveEdit(vault.id, e)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FolderOpen className="h-4 w-4 shrink-0" />
                      <span className="truncate">{vault.name}</span>
                      {activeVault?.id === vault.id && (
                        <Check className="h-3 w-3 shrink-0 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => handleStartEdit(vault, e)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => handleRemove(vault.id, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={onAddVault} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Add Vault
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
