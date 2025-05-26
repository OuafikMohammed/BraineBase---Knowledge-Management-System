"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronDown,
  ChevronRight,
  File,
  FileText,
  Folder,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Save,
  ArrowLeft,
  FolderPlus,
  FilePlus,
  Check,
  History,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import TiptapEditor from "@/components/tiptap/tiptap-editor"
import AIResumeDialog from "@/components/tiptap/ai-resume-dialog"
import { useUserRole } from "@/components/user-role-context"
import { vaultService } from "@/lib/vault-service"
import { generateResumeSummary } from "@/lib/azure-ai-client"

const GITHUB_TOKEN = "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" // Provided by user

export default function VaultPage() {
  const params = useParams()
  const router = useRouter()
  const vaultId = params.vaultId
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  const [vault, setVault] = useState(null)
  const [loadingVault, setLoadingVault] = useState(false)
  const vaultCache = useRef(new Map())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeItem, setActiveItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createType, setCreateType] = useState("file") // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState("")
  const [parentFolderId, setParentFolderId] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState({})
  const editorRef = useRef(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [isAIResumeDialogOpen, setIsAIResumeDialogOpen] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [noteVersions, setNoteVersions] = useState([])
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverItem, setDragOverItem] = useState(null)
  const [searchTags, setSearchTags] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { role, isAdmin, isEditor } = useUserRole()

  // Cache invalidation timer
  useEffect(() => {
    const cacheInvalidationInterval = setInterval(() => {
      vaultCache.current.clear()
    }, 5 * 60 * 1000) // Clear cache every 5 minutes
    return () => clearInterval(cacheInvalidationInterval)
  }, [])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Handle AI resume request
  const handleAIResume = (text) => {
    setSelectedText(text)
    setIsAIResumeDialogOpen(true)
  }

  // Apply AI summary to the editor
  const applyAISummary = (summary) => {
    if (editorRef.current) {
      editorRef.current.insertContent(summary)
    }
    setIsAIResumeDialogOpen(false)
  }

  // Generate AI Summary using Azure ModelClient
  const generateAISummary = async () => {
    if (!selectedText) return
    setIsGenerating(true)
    try {
      const summary = await generateResumeSummary({
        token: GITHUB_TOKEN,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise, professional resume bullet points from selected text.'
          },
          {
            role: 'user',
            content: selectedText
          }
        ],
        temperature: 0.7,
        top_p: 0.7
      })
      applyAISummary(summary)
      toast({
        title: "Summary Generated",
        description: "Your AI-generated resume bullet point is ready.",
        variant: "success"
      })
    } catch (error) {
      console.error("Error generating AI summary:", error)
      toast({
        title: "Error",
        description: "Failed to generate summary using AI.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Load vault data
  const loadVaultData = useCallback(async () => {
    if (!vaultId || vaultId === 'undefined') {
      console.error('Invalid vault ID:', vaultId)
      toast({
        title: "Error",
        description: "Invalid vault ID. Redirecting to notes page.",
        variant: "destructive",
      })
      router.push('/notes')
      return
    }

    if (vaultCache.current.has(vaultId)) {
      const cachedData = vaultCache.current.get(vaultId)
      const cacheAge = Date.now() - cachedData.timestamp
      if (cacheAge < 5 * 60 * 1000) {
        setVault(cachedData.data)
        return
      }
    }

    setLoadingVault(true)
    try {
      const vaultData = await vaultService.getVault(vaultId)
      if (!vaultData) {
        toast({
          title: "Error",
          description: "Vault not found.",
          variant: "destructive",
        })
        router.push('/notes')
        return
      }

      const normalizedData = {
        ...vaultData,
        items: vaultData.items || [],
      }

      vaultCache.current.set(vaultId, {
        data: normalizedData,
        timestamp: Date.now()
      })

      setVault(normalizedData)

      if (!activeItem && normalizedData.items.length > 0) {
        const firstFile = normalizedData.items.find((item) => item.element_type === "FILE")
        if (firstFile) {
          setActiveItem(firstFile)
          setTags(firstFile.tags || [])
          setNoteVersions(firstFile.versions || [])
        }
      }

    } catch (error) {
      console.error("Error loading vault data:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load vault data",
        variant: "destructive",
      })
      router.push('/notes')
    } finally {
      setLoadingVault(false)
    }
  }, [vaultId, router, activeItem])

  useEffect(() => {
    loadVaultData()
  }, [loadVaultData])

  useEffect(() => {
    if (activeItem) {
      setTags(activeItem.tags || [])
      setNoteVersions(activeItem.versions || [])
    }
  }, [activeItem])

  // Auto-save functionality
  const [contentChanged, setContentChanged] = useState(false)
  const autoSaveIntervalRef = useRef(null)

  useEffect(() => {
    if (contentChanged && activeItem) {
      if (autoSaveIntervalRef.current) {
        clearTimeout(autoSaveIntervalRef.current)
      }
      autoSaveIntervalRef.current = setTimeout(() => {
        handleSaveContent(true)
      }, 5000)
    }
    return () => {
      if (autoSaveIntervalRef.current) {
        clearTimeout(autoSaveIntervalRef.current)
      }
    }
  }, [contentChanged])

  // Handle content change in the editor
  const handleContentChange = (content) => {
    setContentChanged(true)
  }

  // Save content
  const handleSaveContent = async (isAutoSave = false) => {
    if (!activeItem || activeItem.element_type !== "FILE" || !editorRef.current) return
    setIsSaving(true)
    const content = editorRef.current.getContent()
    try {
      await vaultService.updateElementContent(activeItem.id_element, content)
      const newVersion = {
        id: noteVersions.length > 0 ? Math.max(...noteVersions.map((v) => v.id)) + 1 : 1,
        date: new Date().toISOString(),
        content: activeItem.content_html,
      }
      const updatedItems = vault.items.map((item) => {
        if (item.id_element === activeItem.id_element) {
          return {
            ...item,
            content_html: content,
            last_edited: new Date().toISOString(),
            versions: [...(item.versions || []), newVersion],
          }
        }
        return item
      })
      setVault({ ...vault, items: updatedItems })
      const updatedActiveItem = updatedItems.find((item) => item.id_element === activeItem.id_element)
      setActiveItem(updatedActiveItem)
      setIsSaving(false)
      setContentChanged(false)
      setLastSaved(new Date())
      if (!isAutoSave) {
        setShowSaveSuccess(true)
        setTimeout(() => setShowSaveSuccess(false), 3000)
        toast({
          title: "Note saved",
          description: "Your note has been saved successfully.",
          variant: "success",
        })
      }
    } catch (error) {
      console.error("Error saving content:", error)
      setIsSaving(false)
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      })
    }
  }

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  // Get root level items
  const getRootItems = () => {
    if (!vault || !vault.items) return []
    return vault.items.filter((item) => item.id_parent === null)
  }

  // Get children of a folder
  const getChildItems = (folderId) => {
    if (!vault) return []
    return vault.items.filter((item) => item.id_parent === folderId)
  }

  // Handle file/folder selection
  const handleItemSelection = (item) => {
    if (item.element_type === "FOLDER") {
      toggleFolder(item.id_element)
    } else {
      if (contentChanged && activeItem) {
        handleSaveContent(true)
      }
      setActiveItem(item)
      setContentChanged(false)
      if (editorRef.current) {
        editorRef.current.setContent(item.content_html || "")
      }
      setTags(item.tags || [])
      setNoteVersions(item.versions || [])
    }
  }

  // Create new item (file or folder)
  const handleCreateItem = async () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      })
      return
    }
    try {
      const newElement = await vaultService.createElement(vaultId, {
        name: newItemName.trim(),
        element_type: createType === "file" ? "FILE" : "FOLDER",
        content_html: createType === "file" ? "" : undefined,
        id_parent: parentFolderId,
      })
      setVault({
        ...vault,
        items: [...vault.items, newElement],
      })
      setNewItemName("")
      setIsCreateDialogOpen(false)
      if (createType === "folder") {
        setExpandedFolders((prev) => ({
          ...prev,
          [newElement.id_element]: true,
        }))
      } else {
        setActiveItem(newElement)
        setTags([])
        setNoteVersions([])
      }
      toast({
        title: `${createType === "file" ? "Note" : "Folder"} created`,
        description: `${newItemName} has been created successfully.`,
      })
    } catch (error) {
      console.error("Error creating item:", error)
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      })
    }
  }

  // Delete item
  const handleDeleteItem = async (itemId) => {
    const itemToDelete = vault.items.find((item) => item.id_element === itemId)
    if (!itemToDelete) return
    if (!window.confirm(`Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`)) {
      return
    }
    try {
      await vaultService.deleteElement(itemId)
      let itemsToDelete = [itemId]
      if (itemToDelete.element_type === "FOLDER") {
        const getDescendants = (parentId) => {
          const children = vault.items.filter((item) => item.id_parent === parentId)
          let descendants = [...children.map((child) => child.id_element)]
          children.forEach((child) => {
            if (child.element_type === "FOLDER") {
              descendants = [...descendants, ...getDescendants(child.id_element)]
            }
          })
          return descendants
        }
        itemsToDelete = [...itemsToDelete, ...getDescendants(itemId)]
      }
      const updatedItems = vault.items.filter((item) => !itemsToDelete.includes(item.id_element))
      setVault({
        ...vault,
        items: updatedItems,
      })
      if (activeItem && itemsToDelete.includes(activeItem.id_element)) {
        setActiveItem(null)
        setTags([])
        setNoteVersions([])
      }
      toast({
        title: `${itemToDelete.element_type === "FILE" ? "Note" : "Folder"} deleted`,
        description: `"${itemToDelete.name}" has been deleted.`,
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  // Add tag
  const addTag = () => {
    if (!newTag.trim()) return
    if (!tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      const updatedItems = vault.items.map((item) => {
        if (item.id_element === activeItem.id_element) {
          return { ...item, tags: updatedTags }
        }
        return item
      })
      setVault({
        ...vault,
        items: updatedItems,
      })
      setActiveItem({
        ...activeItem,
        tags: updatedTags,
      })
      toast({
        title: "Tag added",
        description: `Tag "${newTag}" has been added.`,
      })
    }
    setNewTag("")
    setIsAddingTag(false)
  }

  // Remove tag
  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    const updatedItems = vault.items.map((item) => {
      if (item.id_element === activeItem.id_element) {
        return { ...item, tags: updatedTags }
      }
      return item
    })
    setVault({
      ...vault,
      items: updatedItems,
    })
    setActiveItem({
      ...activeItem,
      tags: updatedTags,
    })
    toast({
      title: "Tag removed",
      description: `Tag "${tagToRemove}" has been removed.`,
    })
  }

  // Format date
  const formatDate = (isoDate) => {
    if (!isoDate) return ""
    const date = new Date(isoDate)
    return date.toLocaleString()
  }

  // Format last saved timestamp
  const formatLastSaved = (date) => {
    if (!date) return ""
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return date.toLocaleDateString()
  }

  // Render sidebar item
  const renderSidebarItem = (item) => {
    const isFolder = item.element_type === "FOLDER"
    const isExpanded = expandedFolders[item.id_element]
    const children = isFolder ? getChildItems(item.id_element) : []
    const isBeingDraggedOver = dragOverItem && dragOverItem.id_element === item.id_element
    return (
      <div key={item.id_element}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`flex items-center py-1 px-2 rounded-md text-sm group ${
                activeItem && activeItem.id_element === item.id_element ? "bg-primary/10 text-primary" : "hover:bg-muted"
              } ${isBeingDraggedOver ? "bg-primary/5 border border-dashed border-primary" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDrop={(e) => isFolder && handleDrop(e, item)}
            >
              {isFolder && (
                <button
                  className="mr-1 p-1 hover:bg-muted rounded-md"
                  onClick={() => toggleFolder(item.id_element)}
                  aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
              )}
              <button
                className="flex items-center flex-1 overflow-hidden"
                onClick={() => handleItemSelection(item)}
              >
                {isFolder ? (
                  <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                )}
                <span className="truncate">{item.name}</span>
                {!isFolder && item.tags && item.tags.length > 0 && (
                  <div className="ml-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {item.tags[0]}
                      {item.tags.length > 1 && `+${item.tags.length - 1}`}
                    </Badge>
                  </div>
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-muted rounded-md">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isFolder && (
                    <>
                      <DropdownMenuItem onClick={() => openCreateDialog("folder", item.id_element)}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        New Subfolder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openCreateDialog("file", item.id_element)}>
                        <FilePlus className="h-4 w-4 mr-2" />
                        New Note
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => handleDeleteItem(item.id_element)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {isFolder && (
              <>
                <ContextMenuItem onClick={() => openCreateDialog("folder", item.id_element)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Subfolder
                </ContextMenuItem>
                <ContextMenuItem onClick={() => openCreateDialog("file", item.id_element)}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Note
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}
            <ContextMenuItem onClick={() => handleDeleteItem(item.id_element)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {isFolder && isExpanded && children.length > 0 && (
          <div className="pl-4 border-l ml-3 mt-1">{children.map((child) => renderSidebarItem(child))}</div>
        )}
      </div>
    )
  }

  // Handle drag and drop on root (move item to root)
  const handleDropOnRoot = (e) => {
    e.preventDefault()
    if (!draggedItem) return
    // Only move if not already at root
    if (draggedItem.id_parent !== null) {
      vaultService.updateElementParent(draggedItem.id_element, null)
        .then(() => {
          const updatedItems = vault.items.map((item) =>
            item.id_element === draggedItem.id_element
              ? { ...item, id_parent: null }
              : item
          )
          setVault({ ...vault, items: updatedItems })
          setDraggedItem(null)
          setDragOverItem(null)
          toast({
            title: "Moved to root",
            description: `\"${draggedItem.name}\" moved to root folder.`,
          })
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: "Failed to move item to root.",
            variant: "destructive",
          })
        })
    }
  }

  if (!vault) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLoginClick={() => {}}
          onSignupClick={() => {}}
          onLogout={() => {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.push("/")
          }}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <div className="inline-block p-4 rounded-full bg-muted mb-4">
              <Folder className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Vault Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The vault you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button asChild>
              <a href="/notes">Return to Vaults</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
        onLogout={() => {}}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="flex-grow flex flex-col">
        {/* Vault header */}
        <div className="border-b p-4">
          <div className="container mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <a href="/notes">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Vaults
                </a>
              </Button>
              <h1 className="text-xl font-bold">{vault.name}</h1>
            </div>
            {/* Create buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => openCreateDialog("folder", null)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
              <Button size="sm" onClick={() => openCreateDialog("file", null)}>
                <FilePlus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-grow flex flex-col md:flex-row">
          {/* Sidebar */}
          <div
            className={`border-r ${isSidebarOpen ? "w-full md:w-64" : "w-0"} transition-all duration-300 overflow-hidden flex flex-col`}
          >
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  className="pl-8 h-8 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-grow">
              <div className="p-2" onDragOver={(e) => e.preventDefault()} onDrop={handleDropOnRoot}>
                {searchQuery.trim()
                  ? getRootItems().filter(
                      (item) =>
                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.element_type === "FILE" &&
                          item.tags &&
                          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
                    ).map((item) => (
                      <div key={item.id_element} className="mb-1">
                        <div
                          className={`flex items-center py-1 px-2 rounded-md text-sm ${
                            activeItem && activeItem.id_element === item.id_element ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          }`}
                          onClick={() => handleItemSelection(item)}
                        >
                          {item.element_type === "FOLDER" ? (
                            <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate">{item.name}</span>
                          {item.element_type === "FILE" && item.tags && item.tags.length > 0 && (
                            <div className="ml-2 flex-shrink-0">
                              <Badge variant="outline" className="text-xs">
                                {item.tags[0]}
                                {item.tags.length > 1 && `+${item.tags.length - 1}`}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  : getRootItems().map((item) => renderSidebarItem(item))}
              </div>
            </ScrollArea>
          </div>
          {/* Main content */}
          <div className="flex-grow overflow-auto">
            <div className="p-4 max-w-4xl mx-auto">
              {activeItem && activeItem.element_type === "FILE" ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-2xl font-bold">{activeItem.name}</h2>
                    <div className="flex items-center gap-2">
                      {lastSaved && (
                        <span className="text-xs text-muted-foreground">
                          {isSaving ? "Saving..." : `Last saved: ${formatLastSaved(lastSaved)}`}
                        </span>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={() => handleSaveContent(false)} disabled={isSaving}>
                              <Save className="h-4 w-4 mr-2" />
                              {isSaving ? "Saving..." : "Save"}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save your note (Ctrl+S)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove ${tag} tag`}
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                    {isAddingTag ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="h-7 text-xs w-24"
                          placeholder="New tag"
                          onKeyDown={(e) => e.key === "Enter" && addTag()}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={addTag} className="h-7 px-2">
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setIsAddingTag(true)} className="h-7 px-2">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Tag
                      </Button>
                    )}
                  </div>
                  {/* Tabs for content and history */}
                  <Tabs defaultValue="content">
                    <TabsList className="mb-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="history">
                        <History className="h-4 w-4 mr-1" />
                        Version History
                        <Badge variant="secondary" className="ml-1">
                          {noteVersions.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="content">
                      {/* Editor */}
                      <TiptapEditor
                        ref={editorRef}
                        content={activeItem.content_html}
                        onChange={handleContentChange}
                        placeholder="Type '/' for commands..."
                        onAIResume={handleAIResume}
                        onSave={() => handleSaveContent(false)}
                        aiResumeButton // Add this prop if TiptapEditor supports it
                      />
                    </TabsContent>
                    <TabsContent value="history">
                      <div className="border rounded-md p-4">
                        <h3 className="text-lg font-medium mb-4">Version History</h3>
                        {noteVersions.length === 0 ? (
                          <p className="text-muted-foreground">No previous versions available.</p>
                        ) : (
                          <div className="space-y-4">
                            {noteVersions.map((version) => (
                              <div key={version.id} className="border rounded-md p-3 hover:bg-muted/50">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <span className="font-medium">Version {version.id}</span>
                                    <span className="text-sm text-muted-foreground ml-2">
                                      {formatDate(version.date)}
                                    </span>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => restoreVersion(version)}>
                                    Restore
                                  </Button>
                                </div>
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {version.content 
                                    ? `${version.content.replace(/<[^>]*>/g, " ").substring(0, 150)}...`
                                    : "No content available"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                  <File className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Note Selected</h3>
                  <p className="text-muted-foreground mb-4">Select a note from the sidebar or create a new one</p>
                  <Button onClick={() => openCreateDialog("file", null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Note
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Create dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createType === "file"
                ? `Create New Note${parentFolderId ? " in Folder" : ""}`
                : `Create New Folder${parentFolderId ? " in Folder" : ""}`}
            </DialogTitle>
            <DialogDescription>
              {createType === "file" ? "Enter a name for your new note" : "Enter a name for your new folder"}
              {parentFolderId && (
                <span className="block mt-1">
                  Parent folder: {vault.items.find((item) => item.id_element === parentFolderId)?.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder={createType === "file" ? "Note name" : "Folder name"}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateItem()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateItem}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* AI Resume Dialog */}
      <AIResumeDialog
        open={isAIResumeDialogOpen}
        onOpenChange={setIsAIResumeDialogOpen}
        text={selectedText}
        onApply={applyAISummary}
        onGenerate={generateAISummary}
        isGenerating={isGenerating}
      />
      {/* Save Success Animation */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-md shadow-lg flex items-center"
          >
            <Check className="h-5 w-5 mr-2" />
            <span>Note saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}