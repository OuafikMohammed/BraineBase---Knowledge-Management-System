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

// Import and use the UserRole context
import { useUserRole } from "@/components/user-role-context"

export default function VaultPage() {
  const params = useParams()
  const router = useRouter()
  const vaultId = params.vaultId
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  const [vault, setVault] = useState(null)
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

  // Add this near the top of the component
  const { role, isAdmin, isEditor } = useUserRole()

  // Mock vault data with nested folders
  const mockVaults = {
    1: {
      id: 1,
      name: "Personal Notes",
      description: "My personal notes and ideas",
      items: [
        { id: 1, type: "folder", name: "Projects", parentId: null },
        { id: 2, type: "folder", name: "Ideas", parentId: null },
        { id: 7, type: "folder", name: "Web Development", parentId: 1 },
        { id: 8, type: "folder", name: "Mobile Apps", parentId: 1 },
        { id: 9, type: "folder", name: "Future Concepts", parentId: 2 },
        {
          id: 3,
          type: "file",
          name: "Goals for 2024",
          content:
            "<h1>My goals for the upcoming year</h1><p>This year I want to:</p><ul><li>Learn a new programming language</li><li>Read at least 20 books</li><li>Exercise regularly</li></ul>",
          parentId: null,
          tags: ["goals", "personal"],
          versions: [
            {
              id: 1,
              date: "2023-12-01T10:30:00Z",
              content: "<h1>My goals for the upcoming year</h1><p>Initial draft</p>",
            },
          ],
          lastEdited: "2023-12-15T14:22:00Z",
        },
        {
          id: 4,
          type: "file",
          name: "React Project",
          content:
            "<h2>Notes for React Project</h2><p>This is an exciting new project that will focus on <strong>React</strong> applications.</p><p>Key areas to explore:</p><ul><li>Component architecture</li><li>State management</li><li>Performance optimization</li></ul><table><thead><tr><th>Feature</th><th>Priority</th><th>Status</th></tr></thead><tbody><tr><td>Authentication</td><td>High</td><td>In Progress</td></tr><tr><td>Dashboard</td><td>Medium</td><td>Planned</td></tr><tr><td>Settings</td><td>Low</td><td>Not Started</td></tr></tbody></table>",
          parentId: 7,
          tags: ["react", "frontend"],
          versions: [],
          lastEdited: "2023-12-10T09:15:00Z",
        },
        {
          id: 5,
          type: "file",
          name: "Flutter App",
          content:
            "<h2>Notes for Flutter App</h2><p>This Flutter app will be a <em>cross-platform</em> solution with the following features:</p><ul><li>User authentication</li><li>Real-time updates</li><li>Mobile responsiveness</li></ul>",
          parentId: 8,
          tags: ["flutter", "mobile"],
          versions: [],
          lastEdited: "2023-12-05T16:45:00Z",
        },
        {
          id: 6,
          type: "file",
          name: "App Idea",
          content:
            "<h1>New App Concept</h1><p>An app that helps people <strong>track their daily habits</strong> and provides insights on productivity patterns.</p><h2>Key Features:</h2><ul><li>Habit tracking</li><li>Data visualization</li><li>Reminder system</li></ul>",
          parentId: 9,
          tags: ["idea", "productivity"],
          versions: [],
          lastEdited: "2023-11-28T11:30:00Z",
        },
      ],
    },
    2: {
      id: 2,
      name: "Work Projects",
      description: "Documentation and notes for work projects",
      items: [
        { id: 1, type: "folder", name: "Client X", parentId: null },
        { id: 2, type: "folder", name: "Client Y", parentId: null },
        {
          id: 3,
          type: "file",
          name: "Meeting Notes",
          content:
            "<h1>Team Meeting Notes</h1><p>Date: <strong>March 10, 2024</strong></p><h2>Agenda:</h2><ol><li>Project updates</li><li>Upcoming deadlines</li><li>Resource allocation</li></ol><p>Action items assigned to team members.</p>",
          parentId: null,
          tags: ["meeting", "team"],
          versions: [],
          lastEdited: "2023-12-14T13:20:00Z",
        },
        {
          id: 4,
          type: "file",
          name: "Project Proposal",
          content:
            "<h1>Project Proposal for Client X</h1><p>This proposal outlines our approach to solving the client's <em>data management challenges</em>.</p><h2>Proposed Solution:</h2><p>A custom dashboard with the following components:</p><ul><li>Data integration layer</li><li>Analytics engine</li><li>Visualization tools</li></ul><table><thead><tr><th>Component</th><th>Timeline</th><th>Resources</th></tr></thead><tbody><tr><td>Data Integration</td><td>2 weeks</td><td>2 engineers</td></tr><tr><td>Analytics Engine</td><td>3 weeks</td><td>1 data scientist, 1 engineer</td></tr><tr><td>Visualization</td><td>2 weeks</td><td>1 designer, 1 engineer</td></tr></tbody></table>",
          parentId: 1,
          tags: ["proposal", "client"],
          versions: [],
          lastEdited: "2023-12-12T10:05:00Z",
        },
        {
          id: 5,
          type: "file",
          name: "Timeline",
          content:
            "<h1>Project Timeline for Client Y</h1><h2>Phase 1: Discovery</h2><p>Duration: <strong>2 weeks</strong></p><h2>Phase 2: Development</h2><p>Duration: <strong>6 weeks</strong></p><h2>Phase 3: Testing</h2><p>Duration: <strong>2 weeks</strong></p><h2>Phase 4: Deployment</h2><p>Duration: <strong>1 week</strong></p>",
          parentId: 2,
          tags: ["timeline", "planning"],
          versions: [],
          lastEdited: "2023-12-08T15:30:00Z",
        },
      ],
    },
  }

  // Load vault data
  useEffect(() => {
    if (vaultId) {
      try {
        if (mockVaults[vaultId]) {
          setVault(mockVaults[vaultId])

          // Set first file as active if no active item
          if (!activeItem) {
            const firstFile = mockVaults[vaultId].items.find((item) => item.type === "file")
            if (firstFile) {
              setActiveItem(firstFile)
              if (firstFile.versions && firstFile.versions.length > 0) {
                setNoteVersions(firstFile.versions)
              }
              if (firstFile.tags) {
                setTags(firstFile.tags)
              }
            }
          }

          // Expand all parent folders of the active item
          if (activeItem && activeItem.parentId) {
            let currentParentId = activeItem.parentId
            const newExpandedFolders = { ...expandedFolders }

            while (currentParentId) {
              newExpandedFolders[currentParentId] = true
              const parentFolder = mockVaults[vaultId].items.find((item) => item.id === currentParentId)
              currentParentId = parentFolder ? parentFolder.parentId : null
            }

            setExpandedFolders(newExpandedFolders)
          }
        } else {
          console.error(`Vault with ID ${vaultId} not found`)
        }
      } catch (error) {
        console.error("Error loading vault data:", error)
      }
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Mock user data
    setUser({
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      status: "Editor",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
    })
    setIsLoggedIn(true)
  }, [vaultId])

  // Update versions and tags when active item changes
  useEffect(() => {
    if (activeItem) {
      if (activeItem.versions) {
        setNoteVersions(activeItem.versions)
      } else {
        setNoteVersions([])
      }

      if (activeItem.tags) {
        setTags(activeItem.tags)
      } else {
        setTags([])
      }
    }
  }, [activeItem])

  // Auto-save functionality
  const [contentChanged, setContentChanged] = useState(false)
  const autoSaveIntervalRef = useRef(null)

  useEffect(() => {
    if (contentChanged && activeItem) {
      // Clear any existing timer
      if (autoSaveIntervalRef.current) {
        clearTimeout(autoSaveIntervalRef.current)
      }

      // Set a new timer
      autoSaveIntervalRef.current = setTimeout(() => {
        handleSaveContent(true)
      }, 5000) // Auto-save after 5 seconds of inactivity
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearTimeout(autoSaveIntervalRef.current)
      }
    }
  }, [contentChanged])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
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
    if (!vault) return []
    return vault.items.filter((item) => item.parentId === null)
  }

  // Get children of a folder
  const getChildItems = (folderId) => {
    if (!vault) return []
    return vault.items.filter((item) => item.parentId === folderId)
  }

  // Open create dialog for a specific parent folder
  const openCreateDialog = (type, parentId = null) => {
    setCreateType(type)
    setParentFolderId(parentId)
    setNewItemName("")
    setIsCreateDialogOpen(true)
  }

  // Create new item (file or folder)
  const handleCreateItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive",
      })
      return
    }

    const newItem = {
      id: Math.max(...vault.items.map((item) => item.id)) + 1,
      type: createType,
      name: newItemName,
      parentId: parentFolderId,
      content: createType === "file" ? "" : undefined,
      tags: createType === "file" ? [] : undefined,
      versions: createType === "file" ? [] : undefined,
      lastEdited: createType === "file" ? new Date().toISOString() : undefined,
    }

    setVault({
      ...vault,
      items: [...vault.items, newItem],
    })

    setNewItemName("")
    setIsCreateDialogOpen(false)

    // If it's a folder, expand it
    if (createType === "folder") {
      setExpandedFolders((prev) => ({
        ...prev,
        [newItem.id]: true,
      }))
    }

    // If it's a file, set it as active
    if (createType === "file") {
      setActiveItem(newItem)
      setTags([])
      setNoteVersions([])
    }

    toast({
      title: `${createType === "file" ? "Note" : "Folder"} created`,
      description: `${newItemName} has been created successfully.`,
    })
  }

  // Update the handleSaveContent function
  const handleSaveContent = (isAutoSave = false) => {
    if (!activeItem || activeItem.type !== "file" || !editorRef.current) return

    setIsSaving(true)
    const content = editorRef.current.getContent()

    // Create a new version
    const newVersion = {
      id: noteVersions.length > 0 ? Math.max(...noteVersions.map((v) => v.id)) + 1 : 1,
      date: new Date().toISOString(),
      content: activeItem.content, // Save the previous content as a version
    }

    // Simulate API call with a small delay
    setTimeout(() => {
      const updatedItems = vault.items.map((item) => {
        if (item.id === activeItem.id) {
          return {
            ...item,
            content,
            lastEdited: new Date().toISOString(),
            versions: [...(item.versions || []), newVersion],
          }
        }
        return item
      })

      setVault({
        ...vault,
        items: updatedItems,
      })

      // Update the active item
      const updatedActiveItem = updatedItems.find((item) => item.id === activeItem.id)
      setActiveItem(updatedActiveItem)

      // Update versions
      if (updatedActiveItem.versions) {
        setNoteVersions(updatedActiveItem.versions)
      }

      setIsSaving(false)
      setContentChanged(false)
      setLastSaved(new Date())

      if (!isAutoSave) {
        // Show success animation
        setShowSaveSuccess(true)
        setTimeout(() => setShowSaveSuccess(false), 3000)

        toast({
          title: "Note saved",
          description: "Your note has been saved successfully.",
          variant: "success",
        })
      }
    }, 500)
  }

  // Add a new function for saving to MongoDB
  const handleSaveToMongoDB = () => {
    if (!activeItem || activeItem.type !== "file" || !editorRef.current) return

    setIsSaving(true)

    // Simulate API call to MongoDB with a small delay
    setTimeout(() => {
      // In a real implementation, this would be an API call to save to MongoDB
      console.log("Saving all notes to MongoDB...")

      setIsSaving(false)

      toast({
        title: "MongoDB Save Complete",
        description: "All notes have been saved to the database.",
        variant: "success",
      })
    }, 800)
  }

  // Delete item
  const handleDeleteItem = (itemId) => {
    // Find the item to delete
    const itemToDelete = vault.items.find((item) => item.id === itemId)
    if (!itemToDelete) return

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`)) {
      return
    }

    // Get all descendant items if it's a folder
    let itemsToDelete = [itemId]

    if (itemToDelete.type === "folder") {
      const getDescendants = (parentId) => {
        const children = vault.items.filter((item) => item.parentId === parentId)
        let descendants = [...children.map((child) => child.id)]

        children.forEach((child) => {
          if (child.type === "folder") {
            descendants = [...descendants, ...getDescendants(child.id)]
          }
        })

        return descendants
      }

      itemsToDelete = [...itemsToDelete, ...getDescendants(itemId)]
    }

    // Filter out deleted items
    const updatedItems = vault.items.filter((item) => !itemsToDelete.includes(item.id))

    setVault({
      ...vault,
      items: updatedItems,
    })

    // Clear active item if it was deleted
    if (activeItem && itemsToDelete.includes(activeItem.id)) {
      setActiveItem(null)
      setTags([])
      setNoteVersions([])
    }

    toast({
      title: `${itemToDelete.type === "file" ? "Note" : "Folder"} deleted`,
      description: `"${itemToDelete.name}" has been deleted.`,
    })
  }

  // Handle content change in the editor
  const handleContentChange = (content) => {
    setContentChanged(true)
  }

  // Format date for last saved timestamp
  const formatLastSaved = (date) => {
    if (!date) return ""

    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // difference in seconds

    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`

    return date.toLocaleDateString()
  }

  // Format ISO date to readable format
  const formatDate = (isoDate) => {
    if (!isoDate) return ""
    const date = new Date(isoDate)
    return date.toLocaleString()
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

  // Restore a previous version
  const restoreVersion = (version) => {
    if (
      !window.confirm(
        "Are you sure you want to restore this version? Your current changes will be saved as a new version.",
      )
    ) {
      return
    }

    if (editorRef.current) {
      // Save current content as a version
      const currentContent = editorRef.current.getContent()
      const newVersion = {
        id: noteVersions.length > 0 ? Math.max(...noteVersions.map((v) => v.id)) + 1 : 1,
        date: new Date().toISOString(),
        content: currentContent,
      }

      // Update the editor with the selected version content
      editorRef.current.setContent(version.content)

      // Update the item
      const updatedItems = vault.items.map((item) => {
        if (item.id === activeItem.id) {
          return {
            ...item,
            content: version.content,
            lastEdited: new Date().toISOString(),
            versions: [...(item.versions || []), newVersion],
          }
        }
        return item
      })

      setVault({
        ...vault,
        items: updatedItems,
      })

      // Update the active item
      const updatedActiveItem = updatedItems.find((item) => item.id === activeItem.id)
      setActiveItem(updatedActiveItem)

      // Update versions
      if (updatedActiveItem.versions) {
        setNoteVersions(updatedActiveItem.versions)
      }

      toast({
        title: "Version restored",
        description: `Version from ${formatDate(version.date)} has been restored.`,
      })
    }
  }

  // Add a new tag
  const addTag = () => {
    if (!newTag.trim()) return

    if (!tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)

      // Update the item
      const updatedItems = vault.items.map((item) => {
        if (item.id === activeItem.id) {
          return { ...item, tags: updatedTags }
        }
        return item
      })

      setVault({
        ...vault,
        items: updatedItems,
      })

      // Update active item
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

  // Remove a tag
  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)

    // Update the item
    const updatedItems = vault.items.map((item) => {
      if (item.id === activeItem.id) {
        return { ...item, tags: updatedTags }
      }
      return item
    })

    setVault({
      ...vault,
      items: updatedItems,
    })

    // Update active item
    setActiveItem({
      ...activeItem,
      tags: updatedTags,
    })

    toast({
      title: "Tag removed",
      description: `Tag "${tagToRemove}" has been removed.`,
    })
  }

  // Handle drag start
  const handleDragStart = (e, item) => {
    setDraggedItem(item)
  }

  // Handle drag over
  const handleDragOver = (e, item) => {
    e.preventDefault()
    if (item.type === "folder") {
      setDragOverItem(item)
    }
  }

  // Handle drop
  const handleDrop = (e, targetFolder) => {
    e.preventDefault()

    if (!draggedItem || draggedItem.id === targetFolder.id) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    // Don't allow dropping a folder into its own descendant
    if (draggedItem.type === "folder") {
      let currentParentId = targetFolder.parentId
      while (currentParentId) {
        if (currentParentId === draggedItem.id) {
          toast({
            title: "Invalid operation",
            description: "Cannot move a folder into its own subfolder.",
            variant: "destructive",
          })
          setDraggedItem(null)
          setDragOverItem(null)
          return
        }
        const parentFolder = vault.items.find((item) => item.id === currentParentId)
        currentParentId = parentFolder ? parentFolder.parentId : null
      }
    }

    // Update the item's parent
    const updatedItems = vault.items.map((item) => {
      if (item.id === draggedItem.id) {
        return { ...item, parentId: targetFolder.id }
      }
      return item
    })

    setVault({
      ...vault,
      items: updatedItems,
    })

    // Expand the target folder
    setExpandedFolders((prev) => ({
      ...prev,
      [targetFolder.id]: true,
    }))

    toast({
      title: "Item moved",
      description: `"${draggedItem.name}" has been moved to "${targetFolder.name}".`,
    })

    setDraggedItem(null)
    setDragOverItem(null)
  }

  // Handle drop on root
  const handleDropOnRoot = (e) => {
    e.preventDefault()

    if (!draggedItem || draggedItem.parentId === null) {
      setDraggedItem(null)
      return
    }

    // Update the item's parent to null (root)
    const updatedItems = vault.items.map((item) => {
      if (item.id === draggedItem.id) {
        return { ...item, parentId: null }
      }
      return item
    })

    setVault({
      ...vault,
      items: updatedItems,
    })

    toast({
      title: "Item moved",
      description: `"${draggedItem.name}" has been moved to the root level.`,
    })

    setDraggedItem(null)
  }

  // Search functionality
  const filteredItems = useCallback(() => {
    if (!vault || !searchQuery.trim()) return null

    return vault.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.type === "file" &&
          item.tags &&
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
    )
  }, [vault, searchQuery])

  // Render sidebar item
  const renderSidebarItem = (item) => {
    const isFolder = item.type === "folder"
    const isExpanded = expandedFolders[item.id]
    const children = isFolder ? getChildItems(item.id) : []
    const isBeingDraggedOver = dragOverItem && dragOverItem.id === item.id

    return (
      <div key={item.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`flex items-center py-1 px-2 rounded-md text-sm group ${
                activeItem && activeItem.id === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
              } ${isBeingDraggedOver ? "bg-primary/5 border border-dashed border-primary" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDrop={(e) => isFolder && handleDrop(e, item)}
            >
              {isFolder && (
                <button
                  className="mr-1 p-1 hover:bg-muted rounded-md"
                  onClick={() => toggleFolder(item.id)}
                  aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
              )}

              <button
                className="flex items-center flex-1 overflow-hidden"
                onClick={() => {
                  if (isFolder) {
                    toggleFolder(item.id)
                  } else {
                    setActiveItem(item)
                  }
                }}
              >
                {isFolder ? (
                  <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                )}
                <span className="truncate">{item.name}</span>

                {/* Show tags for files */}
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
                      <DropdownMenuItem onClick={() => openCreateDialog("folder", item.id)}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        New Subfolder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openCreateDialog("file", item.id)}>
                        <FilePlus className="h-4 w-4 mr-2" />
                        New Note
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => handleDeleteItem(item.id)}>
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
                <ContextMenuItem onClick={() => openCreateDialog("folder", item.id)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Subfolder
                </ContextMenuItem>
                <ContextMenuItem onClick={() => openCreateDialog("file", item.id)}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Note
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}
            <ContextMenuItem onClick={() => handleDeleteItem(item.id)}>
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

  if (!vault) {
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

            {/* Create buttons always visible for all roles */}
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
                  ? // Search results
                    filteredItems()?.map((item) => (
                      <div key={item.id} className="mb-1">
                        <div
                          className={`flex items-center py-1 px-2 rounded-md text-sm ${
                            activeItem && activeItem.id === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                          }`}
                          onClick={() => item.type === "file" && setActiveItem(item)}
                        >
                          {item.type === "folder" ? (
                            <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                          )}
                          <span className="truncate">{item.name}</span>

                          {item.type === "file" && item.tags && item.tags.length > 0 && (
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
                  : // Normal folder structure
                    getRootItems().map((item) => renderSidebarItem(item))}
              </div>
            </ScrollArea>
          </div>

          {/* Main content */}
          <div className="flex-grow overflow-auto">
            <div className="p-4 max-w-4xl mx-auto">
              {activeItem && activeItem.type === "file" ? (
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
                        content={activeItem.content}
                        onChange={handleContentChange}
                        placeholder="Type '/' for commands..."
                        onAIResume={handleAIResume}
                        onSave={() => handleSaveContent(false)}
                        onSaveAll={handleSaveToMongoDB}
                      />
                    </TabsContent>

                    <TabsContent value="history">
                      <div className="border rounded-md p-4">
                        <h3 className="text-lg font-medium mb-4">Version History</h3>

                        {noteVersions.length === 0 ? (
                          <p className="text-muted-foreground">No previous versions available.</p>
                        ) : (
                          <div className="space-y-4">
                            {noteVersions.map((version, index) => (
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
                                  {version.content.replace(/<[^>]*>/g, " ").substring(0, 150)}...
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
                  Parent folder: {vault.items.find((item) => item.id === parentFolderId)?.name}
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
