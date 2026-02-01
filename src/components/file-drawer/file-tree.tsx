"use client"

import { useState } from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface FileNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: FileNode[]
}

interface FileTreeProps {
  files: FileNode[]
  selectedFile: string | null
  onFileSelect: (path: string) => void
}

interface FileTreeItemProps {
  node: FileNode
  depth: number
  selectedFile: string | null
  onFileSelect: (path: string) => void
}

function FileTreeItem({ node, depth, selectedFile, onFileSelect }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isSelected = selectedFile === node.path

  if (node.type === "folder") {
    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start gap-1 px-2 h-8 font-normal",
            "hover:bg-secondary/50"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isExpanded && "rotate-90"
            )}
          />
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-primary" />
          )}
          <span className="truncate">{node.name}</span>
        </Button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start gap-1 px-2 h-8 font-normal",
        isSelected ? "bg-primary/20 text-primary-foreground" : "hover:bg-secondary/50"
      )}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
      onClick={() => onFileSelect(node.path)}
    >
      <File className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{node.name}</span>
    </Button>
  )
}

export function FileTree({ files, selectedFile, onFileSelect }: FileTreeProps) {
  return (
    <ScrollArea className="h-full">
      <div className="py-2">
        {files.map((node) => (
          <FileTreeItem
            key={node.path}
            node={node}
            depth={0}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
