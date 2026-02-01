"use client"

import { useState, useCallback, useRef, useEffect } from 'react'

export interface FolderFile {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FolderFile[]
}

export function useFolder() {
  const [folderPath, setFolderPath] = useState<string | null>(null)
  const [files, setFiles] = useState<FolderFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true) // Default true to avoid flash
  
  // Store the directory handle for file operations
  const dirHandleRef = useRef<FileSystemDirectoryHandle | null>(null)
  // Store file handles for quick access
  const fileHandlesRef = useRef<Map<string, FileSystemFileHandle>>(new Map())

  // Check if File System Access API is supported (client-side only)
  useEffect(() => {
    const supported = 'showDirectoryPicker' in window
    console.log('File System Access API supported:', supported)
    console.log('Secure context:', window.isSecureContext)
    console.log('User agent:', navigator.userAgent)
    setIsSupported(supported)
  }, [])

  // Recursively load files from directory
  const loadFiles = useCallback(async (dirHandle: FileSystemDirectoryHandle, basePath = '') => {
    fileHandlesRef.current.clear()
    
    async function scanDir(handle: FileSystemDirectoryHandle, currentPath: string): Promise<FolderFile[]> {
      const entries: FolderFile[] = []
      
      // @ts-ignore - values() exists on FileSystemDirectoryHandle
      for await (const entry of handle.values()) {
        const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name
        
        if (entry.kind === 'file') {
          // Only include markdown files
          if (entry.name.endsWith('.md')) {
            entries.push({
              name: entry.name,
              path: entryPath,
              type: 'file',
            })
            // Store handle for later file operations
            fileHandlesRef.current.set(entryPath, entry as FileSystemFileHandle)
          }
        } else if (entry.kind === 'directory') {
          // Recursively scan subdirectories
          const children = await scanDir(entry as FileSystemDirectoryHandle, entryPath)
          if (children.length > 0) {
            entries.push({
              name: entry.name,
              path: entryPath,
              type: 'folder',
              children,
            })
          }
        }
      }
      
      // Sort: folders first, then alphabetically
      return entries.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
    }
    
    const scanned = await scanDir(dirHandle, basePath)
    setFiles(scanned)
  }, [])

  // Select a folder using File System Access API
  // Returns the folder name if successful, null otherwise
  const selectFolder = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      setError('File System Access API not supported. Use Chrome or Edge.')
      return null
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // @ts-ignore - showDirectoryPicker exists in Chrome/Edge
      const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
      })
      
      dirHandleRef.current = dirHandle
      setFolderPath(dirHandle.name)
      
      // Load files from the directory
      await loadFiles(dirHandle)
      
      return dirHandle.name
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled - not an error
        return null
      }
      setError(err.message || 'Failed to select folder')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, loadFiles])

  // Read a markdown file
  const readFile = useCallback(async (filePath: string): Promise<string | null> => {
    const fileHandle = fileHandlesRef.current.get(filePath)
    if (!fileHandle) {
      console.error('File handle not found:', filePath)
      return null
    }
    
    try {
      const file = await fileHandle.getFile()
      return await file.text()
    } catch (err) {
      console.error('Failed to read file:', err)
      return null
    }
  }, [])

  // Write a markdown file
  const writeFile = useCallback(async (filePath: string, content: string): Promise<boolean> => {
    const fileHandle = fileHandlesRef.current.get(filePath)
    if (!fileHandle) {
      console.error('File handle not found:', filePath)
      return false
    }
    
    try {
      // @ts-ignore - createWritable exists on FileSystemFileHandle
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
      return true
    } catch (err) {
      console.error('Failed to write file:', err)
      return false
    }
  }, [])

  // Create a new markdown file with optional initial content
  const createFile = useCallback(async (fileName: string, content: string = ""): Promise<string | null> => {
    if (!dirHandleRef.current) return null
    
    const name = fileName.endsWith('.md') ? fileName : `${fileName}.md`
    
    try {
      const fileHandle = await dirHandleRef.current.getFileHandle(name, { create: true })
      const path = name
      fileHandlesRef.current.set(path, fileHandle)
      
      // Write initial content if provided
      if (content) {
        // @ts-ignore - createWritable exists on FileSystemFileHandle
        const writable = await fileHandle.createWritable()
        await writable.write(content)
        await writable.close()
      }
      
      // Refresh file list
      await loadFiles(dirHandleRef.current)
      
      return path
    } catch (err) {
      console.error('Failed to create file:', err)
      return null
    }
  }, [loadFiles])

  // Clear the selected folder
  const clearFolder = useCallback(() => {
    dirHandleRef.current = null
    fileHandlesRef.current.clear()
    setFolderPath(null)
    setFiles([])
  }, [])

  // Refresh files list
  const refreshFiles = useCallback(async () => {
    if (dirHandleRef.current) {
      await loadFiles(dirHandleRef.current)
    }
  }, [loadFiles])

  return {
    folderPath,
    files,
    isLoading,
    error,
    isSupported,
    selectFolder,
    readFile,
    writeFile,
    createFile,
    clearFolder,
    refreshFiles,
  }
}
