"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useRouter } from "next/navigation"
import { useUserRole } from "@/components/user-role-context"
import PdfUploader from "../../components/pdfs/pdf-uploader"
import PdfViewer from "../../components/pdfs/pdf-viewer"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
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
  Folder 
} from "lucide-react"
import { pdfService } from "@/lib/pdf-service"
import { collectionService } from "@/lib/collection-service"

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState([])
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("")
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pdfToDelete, setPdfToDelete] = useState(null)
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [pdfToModify, setPdfToModify] = useState(null)
  const [newPdfName, setNewPdfName] = useState("")
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [pdfToAddToCollection, setPdfToAddToCollection] = useState(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState(null)

  const router = useRouter()
  const { isAdmin, isEditor } = useUserRole()

  // Get unique categories from PDFs
  const categories = ["all", ...new Set(pdfs.map((pdf) => pdf.category || "Uncategorized"))]

  // Filtered PDFs based on search and category
  const filteredPDFs = pdfs.filter(
    (pdf) =>
      (activeCategory === "all" || pdf.category === activeCategory || 
       (activeCategory === "Uncategorized" && !pdf.category)) &&
      (pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       pdf.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Fetch PDFs and collections on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const data = await pdfService.getAllPdfs()
        setPdfs(data)

        const collectionsData = await collectionService.getAllCollections()
        setCollections(collectionsData)

      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load PDFs and collections",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Handler functions for CRUD operations
  const handleDeletePdf = (pdfId) => {
    setPdfToDelete(pdfId)
    setShowDeleteDialog(true)
  }

  const confirmDeletePdf = async () => {
    try {
      await pdfService.deletePdf(pdfToDelete)
      setPdfs(prev => prev.filter(pdf => pdf.id !== pdfToDelete))
      toast({ description: "PDF deleted successfully" })
    } catch (error) {
      console.error("Error deleting PDF:", error)
      toast({
        title: "Error",
        description: "Failed to delete PDF",
        variant: "destructive"
      })
    } finally {
      setShowDeleteDialog(false)
      setPdfToDelete(null)
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
      await pdfService.updatePdf(pdfToModify, { title: newPdfName })
      setPdfs(prev => prev.map(pdf => 
        pdf.id === pdfToModify 
          ? { ...pdf, title: newPdfName }
          : pdf
      ))
      toast({ description: "PDF updated successfully" })
    } catch (error) {
      console.error("Error updating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to update PDF",
        variant: "destructive"
      })
    } finally {
      setShowModifyDialog(false)
      setPdfToModify(null)
      setNewPdfName("")
    }
  }

  const handleCreateCollection = (pdfId) => {
    setPdfToAddToCollection(pdfId)
    setShowCreateCollectionDialog(true)
  }

  const confirmCreateCollection = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCollectionName,
          visibility: "private"
        })
      })

      if (response.ok) {
        const newCollection = await response.json()
        setCollections([...collections, newCollection])
        toast({ description: "Collection created successfully" })

        // Add PDF to the new collection
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
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/collections/${collectionId}/pdfs/${pdfId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({ description: "PDF added to collection successfully" })
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

  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf)
    setShowPdfViewer(true)
  }

  const handleDownloadPdf = async (pdfId) => {
    try {
      const response = await fetch(`/api/pdfs/${pdfId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `document-${pdfId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      })
    }
  }

  // State for upload form
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadCategory, setUploadCategory] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={true}
        user={null}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
        onLogout={() => {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
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
            <Button onClick={() => setShowUploadDialog(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
            <Button 
              onClick={() => setShowCreateCollectionDialog(true)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Collection
            </Button>
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
                          activeCategory === category 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
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
                <h2 className="text-xl font-semibold">
                  {activeCategory === "all" ? "All Documents" : activeCategory === "Uncategorized" ? "Uncategorized" : activeCategory}
                </h2>
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
                            <span>Category: {pdf.category || "Uncategorized"}</span>
                            <span>Size: {(pdf.size / 1024).toFixed(2)} KB</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span>Added: {new Date(pdf.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewPdf(pdf)}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadPdf(pdf.id)}
                                className="flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No PDFs Found</h3>
                      <p className="text-muted-foreground">
                        We couldn't find any PDFs matching your search criteria.
                      </p>
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
                              <p className="text-xs text-muted-foreground">Added: {new Date(pdf.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm">{pdf.category || "Uncategorized"}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm">{(pdf.size / 1024).toFixed(2)} KB</span>
                        </div>
                        <div className="col-span-2 flex items-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewPdf(pdf)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownloadPdf(pdf.id)}
                          >
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

      {/* Dialogs */}
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
            <AlertDialogAction 
              onClick={confirmDeletePdf} 
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent aria-describedby="pdf-rename-description">
          <DialogHeader>
            <DialogTitle>Rename PDF</DialogTitle>
            <DialogDescription id="pdf-rename-description">
              Enter a new name for your PDF document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pdf-name">PDF Name</Label>
              <Input 
                id="pdf-name" 
                value={newPdfName} 
                onChange={(e) => setNewPdfName(e.target.value)} 
              />
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

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload PDF</DialogTitle>
            <DialogDescription>
              Upload a PDF document to your library.
            </DialogDescription>
          </DialogHeader>
          
          <PdfUploader 
            onSuccess={(newPdf) => {
              setPdfs(prev => [newPdf, ...prev])
              setShowUploadDialog(false)
              toast({ description: "PDF uploaded successfully" })
            }}
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUploadDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PdfViewer
        isOpen={showPdfViewer}
        onClose={() => {
          setShowPdfViewer(false)
          setSelectedPdf(null)
        }}
        pdfId={selectedPdf?.id}
        pdfTitle={selectedPdf?.title}
      />
    </div>
  )
}