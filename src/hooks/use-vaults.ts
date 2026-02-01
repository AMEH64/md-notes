"use client"

import { useState, useEffect, useCallback } from 'react'

export interface Vault {
  id: string
  name: string
  folderName: string // Original folder name from picker
  createdAt: number
}

const VAULTS_STORAGE_KEY = 'mdnotes_vaults'
const ACTIVE_VAULT_KEY = 'mdnotes_active_vault'

// Load initial state from localStorage (runs once on module load)
function getInitialVaults(): Vault[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(VAULTS_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse vaults:', e)
    }
  }
  return []
}

function getInitialActiveVaultId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_VAULT_KEY)
}

export function useVaults() {
  const [vaults, setVaults] = useState<Vault[]>(getInitialVaults)
  const [activeVaultId, setActiveVaultId] = useState<string | null>(getInitialActiveVaultId)

  // Save vaults to localStorage whenever they change
  useEffect(() => {
    if (vaults.length > 0) {
      localStorage.setItem(VAULTS_STORAGE_KEY, JSON.stringify(vaults))
    } else {
      localStorage.removeItem(VAULTS_STORAGE_KEY)
    }
  }, [vaults])

  // Save active vault ID
  useEffect(() => {
    if (activeVaultId) {
      localStorage.setItem(ACTIVE_VAULT_KEY, activeVaultId)
    } else {
      localStorage.removeItem(ACTIVE_VAULT_KEY)
    }
  }, [activeVaultId])

  // Add a new vault
  const addVault = useCallback((folderName: string, customName?: string): Vault => {
    const vault: Vault = {
      id: crypto.randomUUID(),
      name: customName || folderName,
      folderName,
      createdAt: Date.now(),
    }
    
    setVaults(prev => [...prev, vault])
    setActiveVaultId(vault.id)
    
    return vault
  }, [])

  // Remove a vault
  const removeVault = useCallback((id: string) => {
    setVaults(prev => prev.filter(v => v.id !== id))
    if (activeVaultId === id) {
      setActiveVaultId(null)
    }
  }, [activeVaultId])

  // Rename a vault
  const renameVault = useCallback((id: string, newName: string) => {
    setVaults(prev => prev.map(v => 
      v.id === id ? { ...v, name: newName } : v
    ))
  }, [])

  // Set active vault
  const setActiveVault = useCallback((id: string | null) => {
    setActiveVaultId(id)
  }, [])

  // Get active vault
  const activeVault = vaults.find(v => v.id === activeVaultId) || null

  return {
    vaults,
    activeVault,
    activeVaultId,
    addVault,
    removeVault,
    renameVault,
    setActiveVault,
  }
}
