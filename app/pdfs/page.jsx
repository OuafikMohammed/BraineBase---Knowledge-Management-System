"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Search,
  FileText,
  Download,
  Eye,
  Upload,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Bookmark,
  Folder,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Footer from "@/components/footer"
import { useRouter } from "next/navigation"

// Import and use the UserRole context
import { useUserRole } from "@/components/user-role-context"

export default function PDFsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const router = useRouter()

  // Add this near the top of the component
  const { role, isAdmin, isEditor, canEditPdf, canDeletePdf } = useUserRole()

  // Mock PDF data
  const [pdfs, setPdfs] = useState([
    {
      id: 1,
      title: "Knowledge Base Setup Guide",
      description: "A comprehensive guide to setting up your knowledge base",
      date: "2023-12-15",
      size: "2.4 MB",
      category: "Guides",
      addedBy: "user123",
    },
    {
      id: 2,
      title: "Content Organization Best Practices",
      description: "Learn how to organize your content effectively",
      date: "2023-11-20",
      size: "1.8 MB",
      category: "Best Practices",
      addedBy: "user456",
    },
    {
      id: 3,
      title: "User Management Manual",
      description: "How to manage users and permissions in your knowledge base",
      date: "2023-10-05",
      size: "3.2 MB",
      category: "Manuals",
      addedBy: "user123",
    },
    {
      id: 4,
      title: "API Documentation",
      description: "Technical documentation for the BrainBase API",
      date: "2023-09-12",
      size: "5.1 MB",
      category: "Technical",
      addedBy: "user789",
    },
    {
      id: 5,
      title: "Content Migration Guide",
      description: "How to migrate content from other platforms to BrainBase",
      date: "2023-08-30",
      size: "1.5 MB",
      category: "Guides",
      addedBy: "user456",
    },
    {
      id: 6,
      title: "Analytics and Reporting",
      description: "Understanding BrainBase analytics and reporting features",
      date: "2023-07-22",
      size: "2.7 MB",
      category: "Features",
      addedBy: "user789",
    },
  ])

  // Add these state variables
  const [collections, setCollections] = useState([
    { id: 1, name: "Favorites" },
    { id: 2, name: "Work Documents" },
    { id: 3, name: "Personal" },
  ])
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pdfToDelete, setPdfToDelete] = useState(null)
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [pdfToModify, setPdfToModify] = useState(null)
  const [newPdfName, setNewPdfName] = useState("")
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [pdfToAddToCollection, setPdfToAddToCollection] = useState(null)

  // Get unique categories
  const categories = ["all", ...new Set(pdfs.map((pdf) => pdf.category))]

  // Filtered PDFs based on search and category
  const filteredPDFs = pdfs.filter(
    (pdf) =>
      (activeCategory === "all" || pdf.category === activeCategory) &&
      (pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pdf.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Check for saved theme preference and user data
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Check if user is logged in (mock implementation)
    const mockUser = {
      id: "user123",
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      status: "Editor",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
    }

    // In a real app, you would check if the user is logged in
    const isUserLoggedIn = true // Mock value

    if (isUserLoggedIn) {
      setUser(mockUser)
      setIsLoggedIn(true)
    }
  }, [])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Mock download function
  const handleDownload = (pdfId) => {
    const pdf = pdfs.find((p) => p.id === pdfId)
    alert(`Downloading: ${pdf.title}`)
  }

  // Mock view function
  const handleView = (pdfId) => {
    const pdf = pdfs.find((p) => p.id === pdfId)
    alert(`Viewing: ${pdf.title}`)
  }

  // Mock upload function
  const handleUpload = () => {
    alert("Upload functionality would be implemented here")
  }

  // Add these handler functions
  const handleDeletePdf = (pdfId) => {
    setPdfToDelete(pdfId)
    setShowDeleteDialog(true)
  }

  const confirmDeletePdf = () => {
    // Filter out the deleted PDF
    const updatedPdfs = pdfs.filter((pdf) => pdf.id !== pdfToDelete)
    setPdfs(updatedPdfs)
    setShowDeleteDialog(false)
    setPdfToDelete(null)
  }

  const handleModifyPdf = (pdfId) => {
    const pdf = pdfs.find((p) => p.id === pdfId)
    setPdfToModify(pdfId)
    setNewPdfName(pdf.title)
    setShowModifyDialog(true)
  }

  const confirmModifyPdf = () => {
    // Update the PDF name
    const updatedPdfs = pdfs.map((pdf) => (pdf.id === pdfToModify ? { ...pdf, title: newPdfName } : pdf))
    setPdfs(updatedPdfs)
    setShowModifyDialog(false)
    setPdfToModify(null)
  }

  const handleCreateCollection = (pdfId) => {
    setPdfToAddToCollection(pdfId)
    setShowCreateCollectionDialog(true)
  }

  const confirmCreateCollection = () => {
    // Create new collection
    const newCollection = {
      id: Math.max(...collections.map((c) => c.id)) + 1,
      name: newCollectionName,
    }
    setCollections([...collections, newCollection])

    // Save PDF to this collection (in a real app, you'd have a many-to-many relationship)
    alert(`PDF saved to new collection: ${newCollectionName}`)

    setShowCreateCollectionDialog(false)
    setNewCollectionName("")
    setPdfToAddToCollection(null)
  }

  const handleSaveToCollection = (pdfId, collectionId) => {
    const collection = collections.find((c) => c.id === collectionId)
    alert(`PDF saved to collection: ${collection.name}`)
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
            <h1 className="text-3xl font-bold">PDF Documents</h1>
            <p className="text-muted-foreground mt-1">Manage and access your PDF documents</p>
          </div>

          {/* Update the upload button to be conditionally rendered based on role */}
          <div className="flex gap-2">
            {(isAdmin || isEditor) && (
              <Button onClick={handleUpload} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload PDF
              </Button>
            )}
            {(isAdmin || isEditor) && (
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Collection
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search PDFs..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-4">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          activeCategory === category ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        {category === "all" ? "All Documents" : category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-4">
                  <h3 className="font-medium mb-3">Quick Access</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted">
                      Recent Documents
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted"
                      onClick={() => router.push("/collections")}
                    >
                      Saved Collections
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted">
                      Shared with Me
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{activeCategory === "all" ? "All Documents" : activeCategory}</h2>
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredPDFs.length > 0 ? (
                    filteredPDFs.map((pdf) => (
                      <Card key={pdf.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-start text-base">
                            <FileText className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{pdf.title}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{pdf.description}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Category: {pdf.category}</span>
                            <span>Size: {pdf.size}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span>Added: {pdf.date}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(pdf.id)}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            {/* Update the PDF actions based on user role */}
                            <DropdownMenuContent align="end">
                              {(isAdmin || (isEditor && pdf.addedBy === user?.id)) && (
                                <>
                                  <DropdownMenuItem onClick={() => handleModifyPdf(pdf.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modify
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeletePdf(pdf.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Bookmark className="h-4 w-4 mr-2" />
                                  Save to
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                  <DropdownMenuSubContent className="w-56">
                                    <div className="p-2">
                                      <Input
                                        placeholder="Search collections..."
                                        className="mb-2"
                                        onChange={(e) => setCollectionSearchQuery(e.target.value)}
                                      />
                                    </div>
                                    {(isAdmin || isEditor) && (
                                      <DropdownMenuItem onClick={() => handleCreateCollection(pdf.id)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create new collection
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>My Collections</DropdownMenuLabel>
                                    {collections.map((collection) => (
                                      <DropdownMenuItem
                                        key={collection.id}
                                        onClick={() => handleSaveToCollection(pdf.id, collection.id)}
                                      >
                                        <Folder className="h-4 w-4 mr-2" />
                                        {collection.name}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDownload(pdf.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No PDFs Found</h3>
                      <p className="text-muted-foreground">We couldn't find any PDFs matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                    <div className="col-span-6">Document</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {filteredPDFs.length > 0 ? (
                    filteredPDFs.map((pdf) => (
                      <div key={pdf.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/50">
                        <div className="col-span-6">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{pdf.title}</p>
                              <p className="text-xs text-muted-foreground">Added: {pdf.date}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm">{pdf.category}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm">{pdf.size}</span>
                        </div>
                        <div className="col-span-2 flex items-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(pdf.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownload(pdf.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No PDFs Found</h3>
                      <p className="text-muted-foreground">We couldn't find any PDFs matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the PDF document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePdf} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modify PDF Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent aria-describedby="pdf-rename-description">
          <DialogHeader>
            <DialogTitle>Rename PDF</DialogTitle>
            <DialogDescription id="pdf-rename-description">Enter a new name for your PDF document.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pdf-name">PDF Name</Label>
              <Input id="pdf-name" value={newPdfName} onChange={(e) => setNewPdfName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModifyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmModifyPdf}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Collection Dialog */}
      <Dialog open={showCreateCollectionDialog} onOpenChange={setShowCreateCollectionDialog}>
        <DialogContent aria-describedby="collection-create-description">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription id="collection-create-description">
              Enter a name for your new collection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCollectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmCreateCollection}>Create Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
