"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function PdfViewer({ isOpen, onClose, pdfId, pdfTitle }) {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && pdfId) {
      const loadPdf = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/pdfs/${pdfId}/view`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          if (!response.ok) {
            throw new Error('Failed to load PDF')
          }
          const blob = await response.blob()
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
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [isOpen, pdfId])

  const handleDownload = async () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="fixed inset-0 z-50">
      <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-xl font-semibold">{pdfTitle}</DialogTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
              title="Download PDF"
              className="hover:bg-muted"
            >
              <Download className="h-4 w-4" />
            </Button>
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
  )
}