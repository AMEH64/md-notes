"use client"

import { useState } from "react"
import { SerializedEditorState } from "lexical"
import { Menu, Settings, Loader2, FolderOpen, FileText } from "lucide-react"

import { Editor } from "@/components/blocks/editor-md/editor"
import { FileTree } from "@/components/file-drawer/file-tree"
import { NewFileDialog } from "@/components/new-file-dialog"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { VaultSelector } from "@/components/vault-selector"
import { useFolder } from "@/hooks/use-folder"
import { useVaults } from "@/hooks/use-vaults"

const initialEditorState = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Welcome to md-notes",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "heading",
        version: 1,
        tag: "h1",
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "A storage-agnostic markdown notes app. Select a folder from your device to get started.",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
      {
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Use any cloud storage that syncs to your device:",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Proton Drive",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: 1,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Google Drive",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: 2,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Dropbox",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: 3,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "iCloud",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: 4,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "list",
        version: 1,
        listType: "bullet",
        start: 1,
        tag: "ul",
      },
      {
        children: [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Getting started:",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Select a folder with your markdown files",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: 1,
            checked: false,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Edit and save your notes",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: 2,
            checked: false,
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: "Use /toggle to check items off",
                type: "text",
                version: 1,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "listitem",
            version: 1,
            value: 3,
            checked: true,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "list",
        version: 1,
        listType: "check",
        start: 1,
        tag: "ul",
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState

export default function Home() {
  const [editorState, setEditorState] = useState<SerializedEditorState>(initialEditorState)
  const [markdownContent, setMarkdownContent] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  const { 
    folderPath, 
    files: folderFiles, 
    isLoading, 
    selectFolder, 
    readFile,
    createFile,
    clearFolder,
    isSupported,
    error: folderError,
  } = useFolder()

  const {
    vaults,
    activeVault,
    addVault,
    removeVault,
    renameVault,
    setActiveVault,
  } = useVaults()

  const handleFileSelect = async (path: string) => {
    setSelectedFile(path)
    setIsDrawerOpen(false)
    
    // Load file content if we have a real folder selected
    if (folderPath) {
      const content = await readFile(path)
      if (content !== null) {
        setMarkdownContent(content)
      }
    }
  }

  const handleAddVault = async () => {
    const folderName = await selectFolder()
    if (folderName) {
      addVault(folderName)
    }
  }

  const handleSelectVault = (id: string) => {
    // Clear current folder state and select the vault
    clearFolder()
    setSelectedFile(null)
    setMarkdownContent(null)
    setActiveVault(id)
  }

  const handleConnectFolder = async () => {
    const folderName = await selectFolder()
    if (!folderName) {
      // User cancelled - stay on current state
      return
    }
  }

  const handleCreateFile = async (fileName: string, content: string) => {
    const path = await createFile(fileName, content)
    if (path) {
      setSelectedFile(path)
      setMarkdownContent(content)
    }
  }

  // No vaults exist - show full-screen welcome
  if (vaults.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold mb-2">md-notes</h1>
          <p className="text-muted-foreground mb-8">
            Storage-agnostic markdown notes. Point it at any folder.
          </p>
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <FolderOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Add your first vault</h2>
          <p className="text-muted-foreground mb-6">
            Select a folder containing your markdown files. Works with any cloud storage that syncs to your device.
          </p>
          <Button size="lg" onClick={handleAddVault} disabled={isLoading || !isSupported}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <FolderOpen className="h-5 w-5 mr-2" />
            )}
            Select Folder
          </Button>
          {!isSupported && (
            <p className="text-sm text-destructive mt-4">
              Requires Chrome, Edge, or Brave on desktop (check console for details)
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh]">
            <DrawerHeader className="border-b p-2">
              <VaultSelector
                vaults={vaults}
                activeVault={activeVault}
                onSelectVault={handleSelectVault}
                onAddVault={handleAddVault}
                onRenameVault={renameVault}
                onRemoveVault={removeVault}
                disabled={isLoading}
              />
            </DrawerHeader>
            {isLoading && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-b flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </div>
            )}
            <FileTree
              files={folderFiles}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
            />
          </DrawerContent>
        </Drawer>
        <span className="text-sm font-medium truncate flex-1">
          {selectedFile?.split("/").pop() || activeVault?.name || "md-notes"}
        </span>
        <NewFileDialog 
          onCreateFile={handleCreateFile} 
          disabled={!folderPath}
        />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r bg-sidebar">
        <div className="flex items-center justify-between border-b p-3">
          <h1 className="font-semibold text-sm">md-notes</h1>
          <div className="flex items-center gap-1">
            <NewFileDialog 
              onCreateFile={handleCreateFile} 
              disabled={!folderPath}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="border-b">
          <VaultSelector
            vaults={vaults}
            activeVault={activeVault}
            onSelectVault={handleSelectVault}
            onAddVault={handleAddVault}
            onRenameVault={renameVault}
            onRemoveVault={removeVault}
            disabled={isLoading}
          />
        </div>
        {isLoading && (
          <div className="px-3 py-2 text-xs text-muted-foreground border-b flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading...
          </div>
        )}
        {folderError && (
          <div className="px-3 py-2 text-xs text-destructive border-b">
            {folderError}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <FileTree
            files={folderFiles}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
          />
        </div>
      </aside>

      {/* Editor area */}
      <main className="flex-1 overflow-hidden pt-14 md:pt-0">
        <div className="h-full p-2 md:p-4">
          {!folderPath ? (
            // Vault exists but folder not loaded (after refresh)
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {activeVault ? `Connect to "${activeVault.name}"` : "Select a vault"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {activeVault 
                    ? "Browser permissions reset on refresh. Click below to reconnect to your folder."
                    : "Select a vault from the sidebar to get started."}
                </p>
                {activeVault && (
                  <Button size="lg" onClick={handleConnectFolder} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <FolderOpen className="h-5 w-5 mr-2" />
                    )}
                    Connect Folder
                  </Button>
                )}
              </div>
            </div>
          ) : !selectedFile ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">No file selected</h2>
                <p className="text-muted-foreground mb-6">
                  Select a file from the sidebar or create a new one.
                </p>
                <NewFileDialog 
                  onCreateFile={handleCreateFile} 
                  disabled={!folderPath}
                />
              </div>
            </div>
          ) : (
            <Editor
              markdown={markdownContent}
              editorSerializedState={markdownContent ? undefined : editorState}
              onSerializedChange={(value) => setEditorState(value)}
            />
          )}
        </div>
      </main>
    </div>
  )
}
