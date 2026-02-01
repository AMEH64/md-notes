"use client"

import { useState } from "react"
import { 
  FilePlus, 
  FileText, 
  Calendar, 
  Users, 
  Lightbulb,
  CheckSquare
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Template {
  id: string
  name: string
  icon: React.ReactNode
  getFileName: () => string
  getContent: () => string
}

const templates: Template[] = [
  {
    id: "blank",
    name: "Blank",
    icon: <FileText className="h-4 w-4" />,
    getFileName: () => "untitled",
    getContent: () => "",
  },
  {
    id: "daily",
    name: "Daily Journal",
    icon: <Calendar className="h-4 w-4" />,
    getFileName: () => {
      const today = new Date()
      return today.toISOString().split('T')[0] // YYYY-MM-DD
    },
    getContent: () => {
      const today = new Date()
      return `# ${today.toISOString().split('T')[0]}

`
    },
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    icon: <Users className="h-4 w-4" />,
    getFileName: () => {
      const today = new Date()
      return `meeting-${today.toISOString().split('T')[0]}`
    },
    getContent: () => `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 

## Agenda

1. 

## Discussion


## Action Items

- [ ] 

## Next Steps

`,
  },
  {
    id: "idea",
    name: "Idea",
    icon: <Lightbulb className="h-4 w-4" />,
    getFileName: () => "idea",
    getContent: () => `# Idea: 

## Problem


## Solution


## Why Now?


## Next Steps

- [ ] 
`,
  },
  {
    id: "todo",
    name: "Todo List",
    icon: <CheckSquare className="h-4 w-4" />,
    getFileName: () => "todo",
    getContent: () => `# Todo

## High Priority

- [ ] 

## Medium Priority

- [ ] 

## Low Priority

- [ ] 

## Done

`,
  },
]

interface NewFileDialogProps {
  onCreateFile: (fileName: string, content: string) => Promise<void>
  disabled?: boolean
}

export function NewFileDialog({ onCreateFile, disabled }: NewFileDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0])
  const [fileName, setFileName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setFileName(template.getFileName())
  }

  const handleCreate = async () => {
    if (!fileName.trim()) return
    
    setIsCreating(true)
    try {
      const name = fileName.endsWith('.md') ? fileName : `${fileName}.md`
      await onCreateFile(name, selectedTemplate.getContent())
      setOpen(false)
      setFileName("")
      setSelectedTemplate(templates[0])
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Reset to default template
      setSelectedTemplate(templates[0])
      setFileName(templates[0].getFileName())
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          disabled={disabled}
          title="New File"
        >
          <FilePlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New File</DialogTitle>
          <DialogDescription>
            Choose a template and name for your new file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Template selection */}
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate.id === template.id ? "default" : "outline"}
                className="justify-start gap-2 h-auto py-3"
                onClick={() => handleTemplateSelect(template)}
              >
                {template.icon}
                {template.name}
              </Button>
            ))}
          </div>
          
          {/* File name input */}
          <div className="space-y-2">
            <label htmlFor="fileName" className="text-sm font-medium">
              File Name
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="fileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate()
                  }
                }}
              />
              <span className="text-muted-foreground text-sm">.md</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!fileName.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
