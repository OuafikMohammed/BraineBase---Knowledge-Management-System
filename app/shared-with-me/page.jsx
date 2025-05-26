"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Folder, FileText, Search, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { collectionService } from "@/lib/collection-service"

export default function SharedWithMePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sharedCollections, setSharedCollections] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])

  // Check authentication state and fetch shared collections
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
      
      fetchSharedCollections()
    } else {
      router.push("/login")
    }
  }, [router])

  // Fetch shared collections
  const fetchSharedCollections = async () => {
    try {
      setIsLoading(true)
      const collections = await collectionService.getSharedCollections()
      setSharedCollections(collections)
      setFilteredCollections(collections)
    } catch (error) {
      console.error("Error fetching shared collections:", error)
      toast({
        title: "Error",
        description: "Failed to load shared collections",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query) {
      const filtered = sharedCollections.filter(
        (collection) =>
          collection.name.toLowerCase().includes(query.toLowerCase()) ||
          collection.description.toLowerCase().includes(query.toLowerCase()) ||
          collection.creator.name.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredCollections(filtered)
    } else {
      setFilteredCollections(sharedCollections)
    }
  }

  // View collection
  const handleViewCollection = (collectionId) => {
    router.push(`/collections/${collectionId}`)
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Shared With Me</h1>
            <p className="text-muted-foreground mt-1">Collections shared with you by other users</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search shared collections..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <Card key={collection.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-start text-base">
                      <Folder className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{collection.name}</span>
                    </CardTitle>
                  </div>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{collection.count} documents</span>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Shared</span>
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center">
                    <p className="text-xs text-muted-foreground mr-2">Shared by:</p>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={collection.creator.avatar} alt={collection.creator.name} />
                        <AvatarFallback>{collection.creator.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{collection.creator.name}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => handleViewCollection(collection.id)}>
                    View Collection
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Shared Collections</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No collections match your search criteria."
                : "No one has shared any collections with you yet."}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
