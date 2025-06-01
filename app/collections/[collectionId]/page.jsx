"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { collectionService } from "@/lib/collection-service"
import { pdfService } from "@/lib/pdf-service"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  FileText,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Search,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useUserRole } from "@/components/user-role-context"

export default function CollectionPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { role } = useUserRole()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const collectionId = params.collectionId
  const [collection, setCollection] = useState(null)
  const [pdfs, setPdfs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pdfToDelete, setPdfToDelete] = useState(null)
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [pdfToModify, setPdfToModify] = useState(null)
  const [newPdfName, setNewPdfName] = useState("")

  // Check authentication state on mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")
    const userEmail = localStorage.getItem("userEmail")
    const userRole = localStorage.getItem("userRole")
    
    if (token && userId) {
      setIsLoggedIn(true)
      setUser({
        id: parseInt(userId),
        name: userName,
        email: userEmail,
        status: userRole || "Viewer",
        profileType: "Standard",
        profileImage: "/placeholder.svg?height=40&width=40"
      })
    } else {
      router.push("/login")
    }
  }, [router])

  // Fetch collection and its PDFs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }        // Fetch collection data
        const collectionData = await collectionService.getCollection(collectionId)
        setCollection(collectionData)

        // Fetch PDFs in this collection
        const pdfsData = await collectionService.getCollectionPdfs(collectionId)
        setPdfs(pdfsData)
      } catch (error) {
        console.error("Error fetching collection data:", error)
        toast({
          title: "Error",
          description: "Failed to load collection",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (collectionId) {
      fetchData()
    }
  }, [collectionId, router, toast])

  // Filter PDFs based on search
  const filteredPDFs = pdfs.filter(
    (pdf) =>
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Check permissions
  const isOwner = collection?.owner?.id === parseInt(localStorage.getItem("userId"))
  const userRole = localStorage.getItem("userRole")
  const userPermission = collection?.sharedWith?.find(
    share => share.userId === parseInt(localStorage.getItem("userId"))
  )?.permission

  // Handle PDF operations
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
      toast({
        description: "PDF removed from collection successfully"
      })
    } catch (error) {
      console.error("Error removing PDF:", error)
      toast({
        title: "Error",
        description: "Failed to remove PDF from collection",
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
      const updatedPdf = await pdfService.updatePdf(pdfToModify, { title: newPdfName })
      setPdfs(prev => prev.map(pdf => pdf.id === pdfToModify ? updatedPdf : pdf))
      setShowModifyDialog(false)
      setPdfToModify(null)
      toast({
        description: "PDF renamed successfully"
      })
    } catch (error) {
      console.error("Error modifying PDF:", error)
      toast({
        title: "Error",
        description: "Failed to rename PDF",
        variant: "destructive"
      })
    }
  }

  const handleView = (pdfId) => {
    router.push(`/pdfs/${pdfId}`)
  }
  const handleDownload = async (pdfId) => {
    try {
      const blob = await pdfService.downloadPdf(pdfId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pdfs.find(p => p.id === pdfId)?.title || 'document.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        description: "PDF downloaded successfully"
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={() => {
            localStorage.removeItem("token")
            localStorage.removeItem("userId")
            localStorage.removeItem("userName")
            localStorage.removeItem("userEmail")
            localStorage.removeItem("userRole")
            setIsLoggedIn(false)
            setUser(null)
            router.push("/")
          }}
        />
        <div className="flex-grow flex items-center justify-center">
          <p>Loading collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={() => {
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          localStorage.removeItem("userName")
          localStorage.removeItem("userEmail")
          localStorage.removeItem("userRole")
          setIsLoggedIn(false)
          setUser(null)
          router.push("/")
        }}
      />
      <div className="flex-grow container mx-auto py-10 px-4">
        {collection ? (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <a href="/collections">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Collections
                </a>
              </Button>
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold">{collection.name}</h1>
                  <Badge variant="outline" className="ml-2 flex items-center gap-1">
                    <span>{collection.visibility}</span>
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">{collection.description}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search PDFs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <DropdownMenuContent align="end">
                      {(isOwner || userRole === "ADMIN" || userPermission === "EDIT") && (
                        <>
                          <DropdownMenuItem onClick={() => handleModifyPdf(pdf.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePdf(pdf.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from Collection
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
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
              <p className="text-muted-foreground">
                {searchQuery
                  ? "We couldn't find any PDFs matching your search criteria."
                  : "This collection is empty. Add PDFs from the PDFs page."}
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent aria-describedby="remove-pdf-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Collection?</AlertDialogTitle>
            <AlertDialogDescription id="remove-pdf-description">
              This will remove the PDF from this collection. The PDF will still be available in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePdf}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modify PDF Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent aria-describedby="modify-pdf-description">
          <DialogHeader>
            <DialogTitle>Rename PDF</DialogTitle>
            <DialogDescription id="modify-pdf-description">Enter a new name for your PDF document.</DialogDescription>
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
    </div>
  )
}