"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download, Edit, Trash2, MoreVertical, Folder, Bookmark, Plus } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { pdfService } from '@/lib/pdf-service'
import { collectionService } from '@/lib/collection-service'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function PdfViewer({ isOpen, onClose, pdfId, pdfTitle, onDelete, onEdit }) {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collections, setCollections] = useState([])
  const [showCreateCollectionDialog, setShowCreateCollectionDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")

  useEffect(() => {
    if (isOpen && pdfId) {
      const loadPdf = async () => {
        try {
          setLoading(true)
          const blob = await pdfService.viewPdf(pdfId)
          const url = URL.createObjectURL(blob)
          setPdfUrl(url)
        } catch (error) {
          console.error('Error loading PDF:', error)
          toast({
            title: "Error",
            description: "Failed to load PDF",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
      loadPdf()

      // Load collections
      const loadCollections = async () => {
        try {
          const data = await collectionService.getAllCollections()
          setCollections(data)
        } catch (error) {
          console.error('Error loading collections:', error)
          toast({
            title: "Error",
            description: "Failed to load collections",
            variant: "destructive"
          })
        }
      }
      loadCollections()
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [isOpen, pdfId])

  const handleDownload = async () => {
    try {
      const blob = await pdfService.downloadPdf(pdfId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pdfTitle || `document-${pdfId}`}.pdf`
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

  const handleAddToCollection = async (collectionId) => {
    try {
      await collectionService.addPdfToCollection(collectionId, pdfId)
      toast({ description: "PDF added to collection successfully" })
    } catch (error) {
      console.error("Error adding PDF to collection:", error)
      toast({
        title: "Error",
        description: "Failed to add PDF to collection",
        variant: "destructive"
      })
    }
  }

  const handleCreateCollection = async () => {
    try {
      const newCollection = await collectionService.createCollection({
        name: newCollectionName,
        visibility: "private"
      })
      setCollections(prev => [...prev, newCollection])
      
      // Add PDF to the new collection
      await handleAddToCollection(newCollection.id)
      setShowCreateCollectionDialog(false)
      setNewCollectionName("")
      toast({ description: "Collection created successfully" })
    } catch (error) {
      console.error("Error creating collection:", error)
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose} className="fixed inset-0 z-50">
        <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle className="text-xl font-semibold">{pdfTitle}</DialogTitle>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                title="Download PDF"
                className="hover:bg-muted"
              >
                <Download className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-muted">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {collections.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Folder className="h-4 w-4 mr-2" />
                        Add to Collection
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {collections.map((collection) => (
                            <DropdownMenuItem
                              key={collection.id}
                              onClick={() => handleAddToCollection(collection.id)}
                            >
                              <Bookmark className="h-4 w-4 mr-2" />
                              {collection.name}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setShowCreateCollectionDialog(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Collection
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuItem onClick={() => onEdit?.(pdfId)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onDelete?.(pdfId)
                      onClose()
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close"
                className="hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 w-full min-h-0 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-lg border bg-white"
                title="PDF Viewer"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateCollectionDialog} onOpenChange={setShowCreateCollectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCollectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
              Create & Add PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}