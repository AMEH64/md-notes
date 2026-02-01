import { $isListItemNode } from "@lexical/list"
import { $getSelection, $isRangeSelection } from "lexical"
import { CheckSquareIcon } from "lucide-react"

import { ComponentPickerOption } from "@/components/editor/plugins/picker/component-picker-option"

export function ToggleCheckboxPickerPlugin() {
  return new ComponentPickerOption("Toggle Checkbox", {
    icon: <CheckSquareIcon className="size-4" />,
    keywords: ["toggle", "check", "uncheck", "checkbox", "done"],
    onSelect: (_, editor) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes()
          for (const node of nodes) {
            const listItem = $isListItemNode(node)
              ? node
              : node.getParent()
            if (listItem && $isListItemNode(listItem)) {
              const checked = listItem.getChecked()
              if (checked !== undefined) {
                listItem.setChecked(!checked)
              }
            }
          }
        }
      })
    },
  })
}
