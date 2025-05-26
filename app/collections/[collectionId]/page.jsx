"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Edit, Trash2, ArrowLeft, Search, Users, Globe, Lock, MoreHorizontal, Eye } from "lucide-react"
import PdfViewer from "@/components/pdfs/pdf-viewer"
import { pdfService } from "@/lib/pdf-service"
import { collectionService } from "@/lib/collection-service"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
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
import { ShareCollectionDialog } from "@/components/collections/share-collection-dialog"
import { CollectionMembers } from "@/components/collections/collection-members"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CollectionPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user, isLoggedIn, isLoading: authLoading } = useAuth()

  const [collection, setCollection] = useState(null)
  const [pdfs, setPdfs] = useState([])
  const [isLoading, setIsLoading] = useState(true)  
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  
  // PDF states
  const [selectedPdf, setSelectedPdf] = useState(null)
  const [pdfToDelete, setPdfToDelete] = useState(null)
  const [pdfToRename, setPdfToRename] = useState(null)
  const [newPdfName, setNewPdfName] = useState("")

  const collectionId = params.collectionId

  // 📁 Load collection and PDFs
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !isLoggedIn || !collectionId) return;

      try {
        setIsLoading(true);
        console.log("Fetching collection:", collectionId);

        const [collectionData, pdfsData] = await Promise.all([
          collectionService.getCollection(collectionId),
          collectionService.getCollectionPdfs(collectionId),
        ]);

        if (!collectionData) {
          console.error("No collection data received");
          toast({
            title: "Error",
            description: "Collection not found",
            variant: "destructive",
          });
          return;
        }

        console.log("Collection data received:", {
          id: collectionData.id,
          name: collectionData.name,
          pdfsCount: pdfsData?.length || 0
        });

        setCollection(collectionData);
        setPdfs(pdfsData || []);
      } catch (error) {
        console.error("Error fetching collection data:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        const errorMessage = 
          error.response?.status === 404 ? "Collection not found" :
          error.response?.status === 403 ? "Access denied" :
          "Failed to load collection";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        if (error.response?.status === 401) {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [collectionId, toast, router, isLoggedIn, authLoading])

  // Handler functions
  const handleViewPdf = async (pdf) => {
    try {
      // Open PDF in the viewer
      setSelectedPdf(pdf)
      setShowPdfViewer(true)
    } catch (error) {
      console.error('Error viewing PDF:', error)
      toast({
        title: "Error",
        description: "Failed to view PDF",
        variant: "destructive"
      })
    }
  }

  const handleDownloadPdf = async (pdfId) => {
    try {
      const blob = await pdfService.downloadPdf(pdfId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const pdf = pdfs.find(p => p.id === pdfId)
      a.download = pdf?.title ? `${pdf.title}.pdf` : `document-${pdfId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast({
        description: "PDF downloaded successfully"
      })
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      })
    }
  }

  const handleRenamePdf = (pdfId) => {
    const pdf = pdfs.find(p => p.id === pdfId)
    if (pdf) {
      setPdfToRename(pdfId)
      setNewPdfName(pdf.title)
      setShowRenameDialog(true)
    }
  }

  const handleDeletePdf = (pdfId) => {
    setPdfToDelete(pdfId)
    setShowDeleteDialog(true)
  }

  const confirmDeletePdf = async () => {
    try {
      await collectionService.removePdfFromCollection(collectionId, pdfToDelete)
      setPdfs(prev => prev.filter(pdf => pdf.id !== pdfToDelete))
      setShowDeleteDialog(false)
      setPdfToDelete(null)
      toast({ description: "PDF removed from collection successfully" })
    } catch (error) {
      console.error('Error removing PDF from collection:', error)
      toast({
        title: "Error",
        description: "Failed to remove PDF from collection",
        variant: "destructive"
      })
    }
  }
  const confirmRenamePdf = async () => {
    if (!newPdfName.trim()) {
      toast({
        title: "Validation Error",
        description: "PDF title cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedPdf = await collectionService.updatePdfInCollection(
        collectionId,
        pdfToRename,
        { title: newPdfName }
      )
      setPdfs((prev) =>
        prev.map((pdf) => (pdf.id === pdfToRename ? updatedPdf : pdf))
      )
      toast({ description: "PDF renamed successfully" })
    } catch (error) {
      console.error("Error renaming PDF:", error)
      toast({
        title: "Error",
        description: "Failed to rename PDF",
        variant: "destructive",
      })
    } finally {
      setShowRenameDialog(false)
      setPdfToRename(null)
      setNewPdfName("")
    }
  }

  // 🧠 Filter PDFs
  const filteredPDFs = pdfs.filter(
    (pdf) =>
      (pdf.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (pdf.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  )

  // 🔐 Permissions
  const isOwner = collection?.created_by === user?.id;

  // 🧩 Render Safely
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading collection...
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2>Collection not found</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token")
            localStorage.removeItem("userId")
            localStorage.removeItem("userName")
            localStorage.removeItem("userEmail")
            localStorage.removeItem("userRole")
          }
          setIsLoggedIn(false)
          setUser(null)
          router.push("/")
        }}
      />

      {/* Main Content */}
      <main className="flex-grow container mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/collections")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="ml-4">              <h1 className="text-3xl font-bold">{collection.name}</h1>
              <p className="text-muted-foreground mt-1">{collection.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(isOwner || collection?.canManageShares) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowMembersDialog(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </Button>
                <Button onClick={() => setShowShareDialog(true)}>
                  Share
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search PDFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">PDFs in Collection</h2>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </div>

          {/* Grid View */}
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPDFs.length > 0 ? (
                filteredPDFs.map((pdf) => (
                  <Card key={pdf.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-base">
                        <FileText className="h-5 w-5 mr-2" />
                        <span>{pdf.title || "Untitled PDF"}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pdf.description || "No description"}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={pdf.user?.avatar} />
                            <AvatarFallback>
                              {pdf.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            Added by {pdf.user?.name || 'Unknown user'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleViewPdf(pdf)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadPdf(pdf.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRenamePdf(pdf.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeletePdf(pdf.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
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
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRenamePdf(pdf.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeletePdf(pdf.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No PDFs Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "We couldn't find any PDFs matching your search."
                      : "This collection is empty. Add some PDFs to get started."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-0">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                <div className="col-span-6">Document</div>
                <div className="col-span-3">Added</div>
                <div className="col-span-3">Size</div>
                <div className="col-span-0 sm:col-span-3"></div>
              </div>

              {filteredPDFs.length > 0 ? (
                filteredPDFs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-6 flex items-center gap-2 truncate">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium truncate">
                        {pdf.title || "Untitled"}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span className="text-sm">
                        {new Date(pdf.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span className="text-sm">
                        {(pdf.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="col-span-0 sm:col-span-3 flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadPdf(pdf.id)}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {isOwner && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRenamePdf(pdf.id)}
                            title="Rename"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePdf(pdf.id)}
                            title="Remove"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 col-span-full">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No PDFs Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "We couldn't find any PDFs matching your search."
                      : "This collection is empty. Add some PDFs to get started."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Delete PDF Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the PDF from this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePdf}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename PDF Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename PDF</DialogTitle>
            <DialogDescription>
              Enter a new name for the PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newPdfName}
                onChange={(e) => setNewPdfName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRenamePdf}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <ShareCollectionDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        collectionId={collectionId}
        onShare={() => {
          // Refresh collection data to get updated sharing settings
          collectionService.getCollection(collectionId).then(setCollection)
        }}
      />

      {/* Members Management Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Collection Members</DialogTitle>
            <DialogDescription>
              Manage who has access to this collection and their roles
            </DialogDescription>
          </DialogHeader>
          <CollectionMembers
            collectionId={collectionId}
            onShareUpdate={() => {
              // Refresh collection data to get updated sharing settings
              collectionService.getCollection(collectionId).then(setCollection)
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMembersDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer */}
      <PdfViewer
        isOpen={showPdfViewer}
        onClose={() => {
          setShowPdfViewer(false)
          setSelectedPdf(null)
        }}
        pdfId={selectedPdf?.id}
        pdfTitle={selectedPdf?.title}
        onDelete={handleDeletePdf}
        onEdit={handleRenamePdf}
      />    </div>
  )
}