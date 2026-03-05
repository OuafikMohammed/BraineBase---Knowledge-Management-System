"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Book, FileText, FolderOpen, Users, Plus, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function KnowledgeBasePage() {
  const params = useParams()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  const [isLoading, setIsLoading] = useState(true)
  const [knowledgeBase, setKnowledgeBase] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  // Mock knowledge base data
  const mockKnowledgeBases = {
    1: {
      id: 1,
      name: "Project Documentation",
      description: "Central repository for all project-related documentation and guidelines.",
      createdAt: "2023-12-15T10:30:00Z",
      updatedAt: "2024-01-10T14:45:00Z",
      documentsCount: 24,
      collaborators: 3,
      tags: ["Projects", "Documentation"],
      categories: ["Guides", "Specifications", "Reports", "Meeting Notes"],
      documents: [
        {
          id: 1,
          title: "Project Overview",
          description: "High-level overview of the project goals and scope.",
          type: "document",
          category: "Guides",
          createdAt: "2023-12-15T10:30:00Z",
          updatedAt: "2024-01-10T14:45:00Z",
        },
        {
          id: 2,
          title: "Technical Specifications",
          description: "Detailed technical specifications for the project implementation.",
          type: "document",
          category: "Specifications",
          createdAt: "2023-12-16T11:20:00Z",
          updatedAt: "2024-01-05T09:30:00Z",
        },
        {
          id: 3,
          title: "User Guides",
          description: "Collection of user guides and tutorials.",
          type: "folder",
          category: "Guides",
          createdAt: "2023-12-18T14:15:00Z",
          updatedAt: "2024-01-08T16:20:00Z",
          itemsCount: 5,
        },
        {
          id: 4,
          title: "Progress Reports",
          description: "Weekly and monthly progress reports.",
          type: "folder",
          category: "Reports",
          createdAt: "2023-12-20T09:45:00Z",
          updatedAt: "2024-01-12T13:10:00Z",
          itemsCount: 8,
        },
        {
          id: 5,
          title: "API Documentation",
          description: "Documentation for the project's API endpoints and usage.",
          type: "document",
          category: "Specifications",
          createdAt: "2023-12-22T15:30:00Z",
          updatedAt: "2024-01-15T10:25:00Z",
        },
        {
          id: 6,
          title: "Team Meeting Notes",
          description: "Notes from team meetings and discussions.",
          type: "folder",
          category: "Meeting Notes",
          createdAt: "2023-12-25T11:00:00Z",
          updatedAt: "2024-01-18T14:50:00Z",
          itemsCount: 12,
        },
        {
          id: 7,
          title: "Design Assets",
          description: "UI/UX design assets and mockups.",
          type: "folder",
          category: "Specifications",
          createdAt: "2023-12-28T13:20:00Z",
          updatedAt: "2024-01-20T09:15:00Z",
          itemsCount: 15,
        },
        {
          id: 8,
          title: "Implementation Plan",
          description: "Detailed plan for project implementation phases.",
          type: "document",
          category: "Guides",
          createdAt: "2023-12-30T10:10:00Z",
          updatedAt: "2024-01-22T11:30:00Z",
        },
      ],
    },
  }

  // Initialize data and check user authentication
  useEffect(() => {
    const id = params.id

    // Simulate loading data
    setTimeout(() => {
      if (mockKnowledgeBases[id]) {
        setKnowledgeBase(mockKnowledgeBases[id])
      }
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
  }, [params.id])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get filtered documents
  const getFilteredDocuments = () => {
    if (!knowledgeBase) return []

    return knowledgeBase.documents.filter(
      (doc) =>
        (activeCategory === "all" || doc.category === activeCategory) &&
        (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
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

        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center mb-8">
            <Skeleton className="h-10 w-10 mr-2" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64">
              <Skeleton className="h-10 w-full mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>

            <div className="flex-grow">
              <Skeleton className="h-10 w-full mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle not found
  if (!knowledgeBase) {
    return (
      <div className="min-h-screen">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLoginClick={() => {}}
          onSignupClick={() => {}}
          onLogout={() => {}}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <div className="container mx-auto py-10 px-4 text-center">
          <Book className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Knowledge Base Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The knowledge base you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/knowledge-bases")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Bases
          </Button>
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

      <div className="flex-grow container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-2">
              <a href="/knowledge-bases">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Knowledge Bases
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Book className="h-6 w-6 mr-2" />
                {knowledgeBase.name}
              </h1>
              <p className="text-muted-foreground mt-1">{knowledgeBase.description}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Access
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Document
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64">
            <div className="sticky top-20">
              <div className="space-y-4">
                <div className="bg-card rounded-lg border shadow-sm p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveCategory("all")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeCategory === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      All Documents
                    </button>
                    {knowledgeBase.categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeCategory === category ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-4">
                  <h3 className="font-medium mb-3">Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <div>{formatDate(knowledgeBase.createdAt)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last updated:</span>
                      <div>{formatDate(knowledgeBase.updatedAt)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Documents:</span>
                      <div>{knowledgeBase.documentsCount}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Collaborators:</span>
                      <div>{knowledgeBase.collaborators}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {knowledgeBase.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-grow">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="folders">Folders</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredDocuments().length > 0 ? (
                    getFilteredDocuments().map((doc) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-start text-base">
                              {doc.type === "document" ? (
                                <FileText className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                              ) : (
                                <FolderOpen className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                              )}
                              <span>{doc.title}</span>
                            </CardTitle>
                            <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Category: {doc.category}</span>
                              <span>Updated: {formatDate(doc.updatedAt)}</span>
                            </div>
                            {doc.type === "folder" && (
                              <div className="text-xs text-muted-foreground mt-1">
                                <span>{doc.itemsCount} items</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery
                          ? "We couldn't find any documents matching your search criteria."
                          : "This knowledge base is empty."}
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Document
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredDocuments().filter((doc) => doc.type === "document").length > 0 ? (
                    getFilteredDocuments()
                      .filter((doc) => doc.type === "document")
                      .map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-start text-base">
                                <FileText className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{doc.title}</span>
                              </CardTitle>
                              <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Category: {doc.category}</span>
                                <span>Updated: {formatDate(doc.updatedAt)}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery
                          ? "We couldn't find any documents matching your search criteria."
                          : "This knowledge base doesn't have any documents yet."}
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Document
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="folders" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredDocuments().filter((doc) => doc.type === "folder").length > 0 ? (
                    getFilteredDocuments()
                      .filter((doc) => doc.type === "folder")
                      .map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-start text-base">
                                <FolderOpen className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{doc.title}</span>
                              </CardTitle>
                              <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Category: {doc.category}</span>
                                <span>Updated: {formatDate(doc.updatedAt)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <span>{doc.itemsCount} items</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Folders Found</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery
                          ? "We couldn't find any folders matching your search criteria."
                          : "This knowledge base doesn't have any folders yet."}
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Folder
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
