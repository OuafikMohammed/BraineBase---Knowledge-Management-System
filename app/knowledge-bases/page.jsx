"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Book, MoreHorizontal, Edit, Trash2, Calendar, Users, Clock, Grid, List } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function KnowledgeBasesPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  const [isLoading, setIsLoading] = useState(true)

  // Knowledge base state
  const [knowledgeBases, setKnowledgeBases] = useState([])
  const [filteredKnowledgeBases, setFilteredKnowledgeBases] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("grid")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentKnowledgeBase, setCurrentKnowledgeBase] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  // Mock data for knowledge bases
  const mockKnowledgeBases = [
    {
      id: 1,
      name: "Project Documentation",
      description: "Central repository for all project-related documentation and guidelines.",
      createdAt: "2023-12-15T10:30:00Z",
      updatedAt: "2024-01-10T14:45:00Z",
      documentsCount: 24,
      collaborators: 3,
      tags: ["Projects", "Documentation"],
    },
    {
      id: 2,
      name: "Research Papers",
      description: "Collection of research papers and academic resources for reference.",
      createdAt: "2023-11-05T09:15:00Z",
      updatedAt: "2024-01-05T11:20:00Z",
      documentsCount: 42,
      collaborators: 5,
      tags: ["Research", "Academic"],
    },
    {
      id: 3,
      name: "Client Onboarding",
      description: "Materials and processes for onboarding new clients to our services.",
      createdAt: "2023-10-20T13:45:00Z",
      updatedAt: "2023-12-28T16:30:00Z",
      documentsCount: 18,
      collaborators: 7,
      tags: ["Clients", "Onboarding"],
    },
    {
      id: 4,
      name: "Product Specifications",
      description: "Detailed specifications and requirements for our product lineup.",
      createdAt: "2023-09-12T08:00:00Z",
      updatedAt: "2023-12-15T10:15:00Z",
      documentsCount: 31,
      collaborators: 4,
      tags: ["Products", "Specifications"],
    },
    {
      id: 5,
      name: "Marketing Materials",
      description: "Marketing assets, campaigns, and strategy documents.",
      createdAt: "2023-08-30T15:20:00Z",
      updatedAt: "2023-11-22T09:45:00Z",
      documentsCount: 27,
      collaborators: 6,
      tags: ["Marketing", "Campaigns"],
    },
    {
      id: 6,
      name: "Team Handbook",
      description: "Guidelines, policies, and procedures for team members.",
      createdAt: "2023-07-18T11:10:00Z",
      updatedAt: "2023-10-05T14:30:00Z",
      documentsCount: 15,
      collaborators: 12,
      tags: ["Team", "Policies"],
    },
    {
      id: 7,
      name: "Technical Documentation",
      description: "Technical guides, API documentation, and code references.",
      createdAt: "2023-06-25T09:30:00Z",
      updatedAt: "2023-09-18T13:20:00Z",
      documentsCount: 53,
      collaborators: 8,
      tags: ["Technical", "API", "Code"],
    },
    {
      id: 8,
      name: "Customer Feedback",
      description: "Compilation of customer feedback, surveys, and improvement suggestions.",
      createdAt: "2023-05-14T14:15:00Z",
      updatedAt: "2023-08-22T10:40:00Z",
      documentsCount: 36,
      collaborators: 5,
      tags: ["Customers", "Feedback"],
    },
    {
      id: 9,
      name: "Training Materials",
      description: "Resources for employee training and skill development.",
      createdAt: "2023-04-30T10:45:00Z",
      updatedAt: "2023-07-15T16:10:00Z",
      documentsCount: 29,
      collaborators: 9,
      tags: ["Training", "Development"],
    },
    {
      id: 10,
      name: "Competitive Analysis",
      description: "Analysis of competitors, market trends, and positioning strategies.",
      createdAt: "2023-03-22T13:30:00Z",
      updatedAt: "2023-06-10T11:25:00Z",
      documentsCount: 17,
      collaborators: 4,
      tags: ["Competition", "Market", "Analysis"],
    },
    {
      id: 11,
      name: "Legal Documents",
      description: "Contracts, agreements, and legal compliance documentation.",
      createdAt: "2023-02-15T09:20:00Z",
      updatedAt: "2023-05-05T15:50:00Z",
      documentsCount: 22,
      collaborators: 3,
      tags: ["Legal", "Compliance"],
    },
    {
      id: 12,
      name: "Product Roadmap",
      description: "Future plans, feature development, and release schedules.",
      createdAt: "2023-01-10T11:00:00Z",
      updatedAt: "2023-04-18T14:15:00Z",
      documentsCount: 14,
      collaborators: 7,
      tags: ["Product", "Roadmap", "Planning"],
    },
    {
      id: 13,
      name: "Design System",
      description: "UI/UX guidelines, design patterns, and brand assets.",
      createdAt: "2022-12-05T14:40:00Z",
      updatedAt: "2023-03-20T10:30:00Z",
      documentsCount: 38,
      collaborators: 6,
      tags: ["Design", "UI/UX", "Brand"],
    },
    {
      id: 14,
      name: "Meeting Notes",
      description: "Archive of meeting minutes, decisions, and action items.",
      createdAt: "2022-11-18T10:15:00Z",
      updatedAt: "2023-02-12T13:45:00Z",
      documentsCount: 47,
      collaborators: 15,
      tags: ["Meetings", "Notes"],
    },
    {
      id: 15,
      name: "Industry Research",
      description: "Research on industry trends, innovations, and best practices.",
      createdAt: "2022-10-22T09:50:00Z",
      updatedAt: "2023-01-15T11:10:00Z",
      documentsCount: 33,
      collaborators: 5,
      tags: ["Industry", "Research", "Trends"],
    },
  ]

  // Initialize data and check user authentication
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setKnowledgeBases(mockKnowledgeBases)
      setFilteredKnowledgeBases(mockKnowledgeBases)
      setTotalPages(Math.ceil(mockKnowledgeBases.length / itemsPerPage))
      setIsLoading(false)
    }, 1000)

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
  }, [itemsPerPage])

  // Filter and sort knowledge bases when search query or sort option changes
  useEffect(() => {
    let filtered = [...knowledgeBases]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (kb) =>
          kb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          kb.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          kb.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case "updated":
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        break
      case "alphabetical":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "documents":
        filtered.sort((a, b) => b.documentsCount - a.documentsCount)
        break
      default:
        break
    }

    setFilteredKnowledgeBases(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, sortBy, knowledgeBases, itemsPerPage])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Get current page items
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    return filteredKnowledgeBases.slice(indexOfFirstItem, indexOfLastItem)
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle create knowledge base
  const handleCreateKnowledgeBase = () => {
    if (!formData.name.trim()) {
      alert("Please enter a name for your knowledge base")
      return
    }

    const newKnowledgeBase = {
      id: Math.max(...knowledgeBases.map((kb) => kb.id), 0) + 1,
      name: formData.name,
      description: formData.description || "No description provided",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentsCount: 0,
      collaborators: 1,
      tags: [],
    }

    setKnowledgeBases((prev) => [newKnowledgeBase, ...prev])
    setShowCreateDialog(false)
    setFormData({ name: "", description: "" })
  }

  // Handle edit knowledge base
  const handleEditKnowledgeBase = () => {
    if (!formData.name.trim()) {
      alert("Please enter a name for your knowledge base")
      return
    }

    setKnowledgeBases((prev) =>
      prev.map((kb) =>
        kb.id === currentKnowledgeBase.id
          ? {
              ...kb,
              name: formData.name,
              description: formData.description || kb.description,
              updatedAt: new Date().toISOString(),
            }
          : kb,
      ),
    )

    setShowEditDialog(false)
    setCurrentKnowledgeBase(null)
    setFormData({ name: "", description: "" })
  }

  // Handle delete knowledge base
  const handleDeleteKnowledgeBase = () => {
    setKnowledgeBases((prev) => prev.filter((kb) => kb.id !== currentKnowledgeBase.id))
    setShowDeleteDialog(false)
    setCurrentKnowledgeBase(null)
  }

  // Open edit dialog
  const openEditDialog = (knowledgeBase) => {
    setCurrentKnowledgeBase(knowledgeBase)
    setFormData({
      name: knowledgeBase.name,
      description: knowledgeBase.description,
    })
    setShowEditDialog(true)
  }

  // Open delete dialog
  const openDeleteDialog = (knowledgeBase) => {
    setCurrentKnowledgeBase(knowledgeBase)
    setShowDeleteDialog(true)
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current page
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            }

            // Show ellipsis for skipped pages
            if (page === 2 && currentPage > 3) {
              return (
                <PaginationItem key="ellipsis-start">
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            if (page === totalPages - 1 && currentPage < totalPages - 2) {
              return (
                <PaginationItem key="ellipsis-end">
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }

            return null
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="flex flex-col space-y-3">
        <Skeleton className="h-[180px] w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))
  }

  // Render grid view
  const renderGridView = () => {
    const currentItems = getCurrentPageItems()

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          renderSkeletons()
        ) : currentItems.length > 0 ? (
          currentItems.map((kb) => (
            <motion.div
              key={kb.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-start text-base">
                      <Book className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{kb.name}</span>
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(kb)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(kb)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription className="line-clamp-2">{kb.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {kb.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created: {formatDate(kb.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Updated: {formatDate(kb.updatedAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Book className="h-4 w-4 mr-2" />
                      <span>{kb.documentsCount} documents</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{kb.collaborators} collaborators</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/knowledge-bases/${kb.id}`)}>
                    Open Knowledge Base
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Knowledge Bases Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "We couldn't find any knowledge bases matching your search criteria."
                : "You haven't created any knowledge bases yet."}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Knowledge Base
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Render list view
  const renderListView = () => {
    const currentItems = getCurrentPageItems()

    return (
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
        ) : currentItems.length > 0 ? (
          currentItems.map((kb) => (
            <motion.div
              key={kb.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium flex items-center">
                        <Book className="h-5 w-5 mr-2 flex-shrink-0" />
                        {kb.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push(`/knowledge-bases/${kb.id}`)}>
                          Open
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(kb)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(kb)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{kb.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {kb.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(kb.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatDate(kb.updatedAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Book className="h-4 w-4 mr-2" />
                      <span>{kb.documentsCount}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{kb.collaborators}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Knowledge Bases Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "We couldn't find any knowledge bases matching your search criteria."
                : "You haven't created any knowledge bases yet."}
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Knowledge Base
            </Button>
          </div>
        )}
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
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/");
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="flex-grow container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Knowledge Bases</h1>
            <p className="text-muted-foreground mt-1">Manage and organize your knowledge repositories</p>
          </div>

          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Knowledge Base
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search knowledge bases..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="documents">Most Documents</SelectItem>
              </SelectContent>
            </Select>

            <div className="border rounded-md flex">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 per page</SelectItem>
                <SelectItem value="9">9 per page</SelectItem>
                <SelectItem value="12">12 per page</SelectItem>
                <SelectItem value="15">15 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <AnimatePresence mode="wait">{viewMode === "grid" ? renderGridView() : renderListView()}</AnimatePresence>

        {renderPagination()}
      </div>

      <Footer />

      {/* Create Knowledge Base Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent aria-describedby="create-kb-description">
          <DialogHeader>
            <DialogTitle>Create New Knowledge Base</DialogTitle>
            <DialogDescription id="create-kb-description">
              Create a new knowledge base to organize your documents and resources.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Knowledge Base Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter knowledge base name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter a description for your knowledge base"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKnowledgeBase}>Create Knowledge Base</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Knowledge Base Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent aria-describedby="edit-kb-description">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Base</DialogTitle>
            <DialogDescription id="edit-kb-description">Update your knowledge base details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Knowledge Base Name</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditKnowledgeBase}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent aria-describedby="delete-kb-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Base?</AlertDialogTitle>
            <AlertDialogDescription id="delete-kb-description">
              This action cannot be undone. This will permanently delete the knowledge base and all of its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKnowledgeBase}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
