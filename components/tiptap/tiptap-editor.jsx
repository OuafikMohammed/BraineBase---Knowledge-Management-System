"use client"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import Color from "@tiptap/extension-color"
import TextStyle from "@tiptap/extension-text-style"
import Dropcursor from "@tiptap/extension-dropcursor"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Gapcursor from "@tiptap/extension-gapcursor"
import { common, createLowlight } from "lowlight"
import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
  LinkIcon,
  Undo,
  Redo,
  TableIcon,
  Highlighter,
  Palette,
  Minus,
  ChevronDown,
  Type,
  Pilcrow,
  Quote,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "prosemirror-state"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Create a lowlight instance with common languages
const lowlight = createLowlight(common)

// Create a custom slash command extension
const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("slashCommand"),
        props: {
          handleKeyDown(view, event) {
            // Check if the user typed '/'
            if (event.key === "/" && !view.state.selection.empty) {
              // Show slash command menu
              return true
            }
            return false
          },
        },
      }),
    ]
  },
})

// Custom table styles extension
const TableStyles = Extension.create({
  name: "tableStyles",
  addGlobalAttributes() {
    return [
      {
        types: ["table"],
        attributes: {
          class: {
            default: "min-w-full border-collapse table-auto border border-gray-300 dark:border-gray-700",
            parseHTML: (element) => element.getAttribute("class"),
            renderHTML: (attributes) => {
              return { class: attributes.class }
            },
          },
        },
      },
      {
        types: ["tableCell", "tableHeader"],
        attributes: {
          class: {
            default: "border border-gray-300 dark:border-gray-700 p-2",
            parseHTML: (element) => element.getAttribute("class"),
            renderHTML: (attributes) => {
              return { class: attributes.class }
            },
          },
        },
      },
    ]
  },
})

const TiptapEditor = forwardRef((props, ref) => {
  // Add error state
  const [hasError, setHasError] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showSlashCommands, setShowSlashCommands] = useState(false)
  const [slashCommandPosition, setSlashCommandPosition] = useState({ x: 0, y: 0 })
  const [placeholder, setPlaceholder] = useState(props.placeholder || "Write something...")
  const [selectedText, setSelectedText] = useState("")
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [saveNotification, setSaveNotification] = useState({ show: false, message: "" })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-md max-w-full",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "min-w-full border-collapse table-auto border border-gray-300 dark:border-gray-700",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 dark:border-gray-700 p-2 bg-muted",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 dark:border-gray-700 p-2",
        },
      }),
      TableStyles,
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Superscript,
      Subscript,
      TextStyle,
      Color,
      Dropcursor,
      HorizontalRule,
      Gapcursor,
    ],
    content: props.content || "",
    onUpdate: ({ editor }) => {
      props.onChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      if (from !== to) {
        setSelectedText(editor.state.doc.textBetween(from, to))
      } else {
        setSelectedText("")
      }
    },
    onKeyDown({ event }) {
      if (event.key === "/") {
        const { view } = editor
        const { state } = view
        const { selection } = state
        const { $from } = selection

        // Only show slash commands at the beginning of a line or after a space
        const textBefore = $from.nodeBefore?.textContent || ""
        const isAtStartOfLine = $from.parentOffset === 0
        const isAfterSpace = textBefore.endsWith(" ")

        if (isAtStartOfLine || isAfterSpace) {
          // Get position for the slash command menu
          const coords = view.coordsAtPos($from.pos)
          setSlashCommandPosition({ x: coords.left, y: coords.bottom })
          setShowSlashCommands(true)
          return true
        }
      }

      // Save with Ctrl+S or Cmd+S
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault()
        if (props.onSave) {
          props.onSave()
          showSaveNotification("Current note saved successfully!")
        }
        return true
      }

      // Hide slash commands when Escape is pressed
      if (event.key === "Escape" && showSlashCommands) {
        setShowSlashCommands(false)
        return true
      }

      return false
    },
  })

  // Add error handling
  if (hasError) {
    return (
      <div className="border rounded-md p-4 bg-red-50 text-red-800">
        <h3 className="font-medium mb-2">Editor Error</h3>
        <p>There was a problem loading the editor. Please try again or refresh the page.</p>
        <button
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm"
          onClick={() => setHasError(false)}
        >
          Try Again
        </button>
      </div>
    )
  }

  // Expose editor methods to parent component
  useImperativeHandle(
    ref,
    () => ({
      getContent: () => editor?.getHTML() || "",
      setContent: (newContent) => {
        editor?.commands.setContent(newContent)
      },
      clearContent: () => {
        editor?.commands.clearContent()
      },
      focus: () => {
        editor?.commands.focus()
      },
      save: () => {
        if (props.onSave) {
          props.onSave()
          showSaveNotification("Current note saved successfully!")
        }
      },
      saveAll: () => {
        if (props.onSaveAll) {
          props.onSaveAll()
          showSaveNotification("All notes saved to MongoDB!")
        }
      },
    }),
    [editor, props.onSave, props.onSaveAll],
  )

  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle click outside to close slash commands
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSlashCommands) {
        setShowSlashCommands(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showSlashCommands])

  // Handle save notification
  const showSaveNotification = (message) => {
    setSaveNotification({ show: true, message })
    setTimeout(() => {
      setSaveNotification({ show: false, message: "" })
    }, 3000)
  }

  // Mock AI summary generation
  const generateAISummary = async () => {
    if (!selectedText) return

    setIsGeneratingSummary(true)
    setShowAIDialog(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate a simple summary (in a real app, this would call an AI API)
    const summary = `Summary of selected text: ${selectedText.substring(0, 50)}...`
    setAiSummary(summary)
    setIsGeneratingSummary(false)
  }

  if (!isMounted) {
    return null
  }

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter URL", previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const addHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run()
  }

  const slashCommands = [
    {
      title: "Text",
      icon: <Type className="h-4 w-4" />,
      command: () => editor.chain().focus().setParagraph().run(),
    },
    {
      title: "Heading 1",
      icon: <Heading1 className="h-4 w-4" />,
      command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      icon: <Heading2 className="h-4 w-4" />,
      command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      icon: <Heading3 className="h-4 w-4" />,
      command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: "Bullet List",
      icon: <List className="h-4 w-4" />,
      command: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      icon: <ListOrdered className="h-4 w-4" />,
      command: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "Task List",
      icon: <ListChecks className="h-4 w-4" />,
      command: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      title: "Code Block",
      icon: <Code className="h-4 w-4" />,
      command: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "Quote",
      icon: <Quote className="h-4 w-4" />,
      command: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "Table",
      icon: <TableIcon className="h-4 w-4" />,
      command: addTable,
    },
    {
      title: "Image",
      icon: <ImageIcon className="h-4 w-4" />,
      command: addImage,
    },
    {
      title: "Horizontal Rule",
      icon: <Minus className="h-4 w-4" />,
      command: addHorizontalRule,
    },
  ]

  const handleSlashCommand = (command) => {
    command.command()
    setShowSlashCommands(false)
  }

  return (
    <TooltipProvider>
      <div className="border rounded-md relative">
        {/* Main Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1">
                    <Pilcrow className="h-4 w-4" />
                    <span>Paragraph</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Format text</TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
                <Pilcrow className="h-4 w-4 mr-2" />
                <span>Paragraph</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" />
                <span>Heading 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" />
                <span>Heading 2</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" />
                <span>Heading 3</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List className="h-4 w-4 mr-2" />
                <span>Bullet List</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered className="h-4 w-4 mr-2" />
                <span>Numbered List</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleTaskList().run()}>
                <ListChecks className="h-4 w-4 mr-2" />
                <span>Task List</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                <Code className="h-4 w-4 mr-2" />
                <span>Code Block</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote className="h-4 w-4 mr-2" />
                <span>Blockquote</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
              >
                <Bold className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
              >
                <Italic className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("underline")}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Toggle underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Toggle strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      "#000000",
                      "#ef4444",
                      "#22c55e",
                      "#3b82f6",
                      "#a855f7",
                      "#f97316",
                      "#14b8a6",
                      "#f59e0b",
                      "#6366f1",
                      "#ec4899",
                    ].map((color) => (
                      <button
                        key={color}
                        className="rounded-md p-2 w-full h-8"
                        style={{ backgroundColor: color }}
                        onClick={() => editor.chain().focus().setColor(color).run()}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipTrigger>
            <TooltipContent>Text color</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("highlight")}
                onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
                aria-label="Toggle highlight"
              >
                <Highlighter className="h-4 w-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Highlight text</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("left").run()}>
                    <AlignLeft className="h-4 w-4 mr-2" />
                    <span>Align Left</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("center").run()}>
                    <AlignCenter className="h-4 w-4 mr-2" />
                    <span>Align Center</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("right").run()}>
                    <AlignRight className="h-4 w-4 mr-2" />
                    <span>Align Right</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
                    <AlignJustify className="h-4 w-4 mr-2" />
                    <span>Justify</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent>Text alignment</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={addImage}>
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-muted")}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={addTable}>
                <TableIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert table</TooltipContent>
          </Tooltip>

          {/* AI Resume Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-1 ml-1"
                onClick={generateAISummary}
                disabled={!selectedText}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                <span className="text-xs">AI Resume</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Generate AI summary of selected text</TooltipContent>
          </Tooltip>

          <div className="flex-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-8 w-8 p-0"
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-8 w-8 p-0"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          {/* Replace the existing Save Button with these two buttons */}
          {/* File-specific Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (props.onSave) {
                    props.onSave()
                    showSaveNotification("Current note saved successfully!")
                  }
                }}
                className="h-8 ml-2"
              >
                Save File
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save current file (Ctrl+S)</TooltipContent>
          </Tooltip>

          {/* Global MongoDB Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (props.onSaveAll) {
                    props.onSaveAll()
                    showSaveNotification("All notes saved to MongoDB!")
                  }
                }}
                className="h-8 ml-1"
              >
                Save to MongoDB
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save all changes to database</TooltipContent>
          </Tooltip>
        </div>

        {/* Bubble Menu */}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bg-background rounded-md shadow-md border p-1 flex gap-1"
          >
            <Toggle
              size="sm"
              pressed={editor.isActive("bold")}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("italic")}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("underline")}
              onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("strike")}
              onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("highlight")}
              onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="h-4 w-4" />
            </Toggle>
            <Button
              variant="ghost"
              size="sm"
              onClick={setLink}
              className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-muted")}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={generateAISummary} disabled={!selectedText} className="h-8 p-1">
              <Sparkles className="h-4 w-4" />
            </Button>
          </BubbleMenu>
        )}

        {/* Slash Commands Menu */}
        {showSlashCommands && (
          <div
            className="absolute z-50 bg-background rounded-md shadow-md border overflow-hidden"
            style={{
              left: slashCommandPosition.x,
              top: slashCommandPosition.y,
            }}
          >
            <Command className="w-60">
              <CommandInput placeholder="Search commands..." />
              <CommandList>
                <CommandEmpty>No commands found.</CommandEmpty>
                <CommandGroup>
                  {slashCommands.map((command, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSlashCommand(command)}
                      className="flex items-center gap-2 p-2"
                    >
                      {command.icon}
                      <span>{command.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}

        <EditorContent
          editor={editor}
          className="prose prose-sm dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
        />

        {/* Save Notification */}
        {saveNotification.show && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-md shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{saveNotification.message}</span>
          </div>
        )}

        {/* AI Resume Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>AI Summary</DialogTitle>
              <DialogDescription>AI-generated summary of your selected text</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isGeneratingSummary ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="bg-muted p-3 rounded-md">{aiSummary}</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAIDialog(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  // In a real app, this would insert the summary into the editor
                  editor.chain().focus().insertContent(aiSummary).run()
                  setShowAIDialog(false)
                }}
                disabled={isGeneratingSummary}
              >
                Insert into document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
})

TiptapEditor.displayName = "TiptapEditor"

export default TiptapEditor
