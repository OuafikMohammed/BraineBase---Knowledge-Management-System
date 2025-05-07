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
import { toast } from "@/components/ui/use-toast"
import api from "@/lib/api"

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState([])
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("")
  const router = useRouter()

  // States for dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pdfToDelete, setPdfToDelete] = useState(null)
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [pdfToModify, setPdfToModify] = useState(null)
  const [newPdfName, setNewPdfName] = useState("")
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [pdfToAddToCollection, setPdfToAddToCollection] = useState(null)

  const { role, isAdmin, isEditor, canEditPdf, canDeletePdf } = useUserRole()

  // Get unique categories from PDFs
  const categories = ["all", ...new Set(pdfs.map((pdf) => pdf.category))]

  // Filtered PDFs based on search and category
  const filteredPDFs = pdfs.filter(
    (pdf) =>
      (activeCategory === "all" || pdf.category === activeCategory) &&
      (pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pdf.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Fetch PDFs and collections on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [pdfResponse, collectionsResponse] = await Promise.all([
          api.get("/pdfs"),
          api.get("/collections")
        ])

        if (pdfResponse.data) {
          setPdfs(pdfResponse.data)
        }

        if (collectionsResponse.data) {
          setCollections(collectionsResponse.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, []) // Empty dependency array means this effect runs once on mount

  // Handler functions for CRUD operations
  const handleDeletePdf = async (pdfId) => {
    setPdfToDelete(pdfId)
    setShowDeleteDialog(true)
  }

  const confirmDeletePdf = async () => {
    try {
      const response = await api.delete(`/pdfs/${pdfToDelete}`)

      if (response.status === 200) {
        setPdfs(prev => prev.filter(pdf => pdf.id !== pdfToDelete))
        setShowDeleteDialog(false)
        setPdfToDelete(null)
        toast({
          description: "PDF deleted successfully"
        })
      }
    } catch (error) {
      console.error("Error deleting PDF:", error)
      toast({
        title: "Error",
        description: "Failed to delete PDF",
        variant: "destructive"
      })
    }
  }

  const handleModifyPdf = (pdfId) => {
    const pdf = pdfs.find(p => p.id === pdfId)
    setPdfToModify(pdfId)
    setNewPdfName(pdf.title)
    setShowModifyDialog(true)
  }

  const confirmModifyPdf = async () => {
    try {
      const response = await api.put(`/pdfs/${pdfToModify}`, { title: newPdfName })

      if (response.status === 200) {
        const updatedPdf = response.data
        setPdfs(prev => prev.map(pdf => pdf.id === pdfToModify ? updatedPdf : pdf))
        setShowModifyDialog(false)
        setPdfToModify(null)
        toast({
          description: "PDF renamed successfully"
        })
      }
    } catch (error) {
      console.error("Error modifying PDF:", error)
      toast({
        title: "Error",
        description: "Failed to rename PDF",
        variant: "destructive"
      })
    }
  }

  const handleCreateCollection = async (pdfId) => {
    setPdfToAddToCollection(pdfId)
    setShowCreateCollectionDialog(true)
  }

  const confirmCreateCollection = async () => {
    try {
      const response = await api.post("/collections", {
        name: newCollectionName,
        visibility: "private"
      })

      if (response.status === 200) {
        const newCollection = response.data
        setCollections([...collections, newCollection])
        toast({
          description: "Collection created successfully"
        })
        
        // Add PDF to the new collection if we have one pending
        if (pdfToAddToCollection) {
          await handleSaveToCollection(pdfToAddToCollection, newCollection.id)
        }
      }
    } catch (error) {
      console.error("Error creating collection:", error)
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive"
      })
    } finally {
      setShowCreateCollectionDialog(false)
      setNewCollectionName("")
      setPdfToAddToCollection(null)
    }
  }

  const handleSaveToCollection = async (pdfId, collectionId) => {
    try {
      const response = await api.post(`/collections/${collectionId}/pdfs/${pdfId}`)

      if (response.status === 200) {
        toast({
          description: "PDF added to collection successfully"
        })
      }
    } catch (error) {
      console.error("Error adding PDF to collection:", error)
      toast({
        title: "Error",
        description: "Failed to add PDF to collection",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={true}
        user={null}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
        onLogout={() => {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          localStorage.removeItem("userRole")
          router.push("/")
        }}
        theme="light"
        toggleTheme={() => {}}
      />

      <div className="flex-grow container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">PDF Documents</h1>
            <p className="text-muted-foreground mt-1">Manage and access your PDF documents</p>
          </div>

          <div className="flex gap-2">
            {(isAdmin || isEditor) && (
              <>
                <Button onClick={() => {}} className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Collection
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                            onClick={() => {}}
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
                            <DropdownMenuContent align="end">
                              {(isAdmin || (isEditor && pdf.addedBy === null)) && (
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
                              <DropdownMenuItem onClick={() => {}}>
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
                          <Button variant="ghost" size="icon" onClick={() => {}}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {}}>
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
