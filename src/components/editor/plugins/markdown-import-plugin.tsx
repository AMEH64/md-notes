"use client"

import { useEffect, useRef } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $convertFromMarkdownString } from "@lexical/markdown"
import { 
  CHECK_LIST,
  ELEMENT_TRANSFORMERS, 
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS, 
  TEXT_MATCH_TRANSFORMERS 
} from "@lexical/markdown"
import { $getRoot } from "lexical"

import { HR } from "@/components/editor/transformers/markdown-hr-transformer"
import { IMAGE } from "@/components/editor/transformers/markdown-image-transformer"
import { TABLE } from "@/components/editor/transformers/markdown-table-transformer"

const TRANSFORMERS = [
  TABLE,
  HR,
  IMAGE,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
]

interface MarkdownImportPluginProps {
  markdown: string | null
}

export function MarkdownImportPlugin({ markdown }: MarkdownImportPluginProps) {
  const [editor] = useLexicalComposerContext()
  const prevMarkdownRef = useRef<string | null>(null)

  useEffect(() => {
    // Only update if markdown changed
    if (markdown === null || markdown === prevMarkdownRef.current) {
      return
    }
    
    prevMarkdownRef.current = markdown

    editor.update(() => {
      const root = $getRoot()
      root.clear()
      $convertFromMarkdownString(markdown, TRANSFORMERS, undefined, false)
    })
  }, [editor, markdown])

  return null
}
