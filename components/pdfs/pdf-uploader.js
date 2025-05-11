"use client"

import { useState } from "react"
import { pdfService } from '@/lib/pdf-service'
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function PdfUploader({ onSuccess }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file || !title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a PDF and enter a title",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title.trim())
    
    if (description.trim()) formData.append("description", description.trim())
    if (category.trim()) formData.append("category", category.trim())
    if (collections?.length) {
      collections.forEach(id => formData.append("collections[]", id))
    }

    setIsLoading(true)
    
    try {
      const result = await pdfService.uploadPdf(formData)
      onSuccess?.(result)
      toast({ description: "PDF uploaded successfully" })
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: "Error",
        description: "Failed to upload PDF",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4 w-full">
      <div>
        <Label htmlFor="pdf-file">PDF File</Label>
        <Input
          id="pdf-file"
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="pdf-title">Title</Label>
        <Input
          id="pdf-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter document title"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="pdf-description">Description</Label>
        <Input
          id="pdf-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="pdf-category">Category</Label>
        <Input
          id="pdf-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Enter category"
          className="w-full"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Uploading...' : 'Upload PDF'}
      </Button>
    </form>
  )
}