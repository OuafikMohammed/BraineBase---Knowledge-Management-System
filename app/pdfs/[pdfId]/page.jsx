"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { pdfService } from "@/lib/pdf-service"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function PdfViewerPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pdfTitle, setPdfTitle] = useState("")

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

  // Fetch and display PDF
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setIsLoading(true)
        const pdfId = params.pdfId
        
        // Get PDF details first
        const pdfDetails = await pdfService.getPdf(pdfId)
        setPdfTitle(pdfDetails.title)
          // Get PDF blob and create URL
        const blob = await pdfService.downloadPdf(pdfId)
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
        setPdfUrl(url)
        
      } catch (error) {
        console.error("Error loading PDF:", error)
        toast({
          title: "Error",
          description: "Failed to load PDF",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.pdfId) {
      fetchPdf()
    }

    // Cleanup
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [params.pdfId, toast])

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
          <p>Loading PDF...</p>
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
      <div className="flex-grow container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{pdfTitle}</h1>
        </div>
        
        <div className="w-full h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title={pdfTitle}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
