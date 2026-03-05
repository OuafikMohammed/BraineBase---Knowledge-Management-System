"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Folder, FileText, Search, Users, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { collectionService } from "@/lib/collection-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SharedWithMePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sharedCollections, setSharedCollections] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  
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
      router.push("/")
    }
  }, [router])

  // Fetch shared collections
  const fetchSharedCollections = async () => {
    try {
      setIsLoading(true)
      const collections = await collectionService.getSharedCollections()
      // Filter out collections that this user shouldn't see
      const filteredCollections = collections.filter(collection => 
        collection.visibility === "public" || // Include all public collections
        (collection.visibility === "shared" && // Include shared collections where user has access
          collection.sharedWith?.some(share => 
            typeof share === 'object' 
              ? share.idProfile === user.id 
              : share === user.id
          ))
      )
      setSharedCollections(filteredCollections)
      setFilteredCollections(filteredCollections)
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
      const filtered = sharedCollections.filter(collection =>
        collection.name.toLowerCase().includes(query.toLowerCase()) ||
        collection.description?.toLowerCase().includes(query.toLowerCase()) ||
        collection.creator?.name?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredCollections(filtered)
    } else {
      setFilteredCollections(sharedCollections)
    }
  }

  // Filter collections by tab
  const getTabCollections = () => {
    switch (activeTab) {
      case "shared":
        return filteredCollections.filter(c => c.visibility === "shared")
      case "public":
        return filteredCollections.filter(c => c.visibility === "public")
      default:
        return filteredCollections
    }
  }

  // Render collections grid
  const renderCollections = () => {
    const collections = getTabCollections()
    return collections.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
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
        <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Collections Found</h3>
        <p className="text-muted-foreground">
          {searchQuery
            ? "No collections match your search."
            : `No ${activeTab === "all" ? "" : activeTab} collections are shared with you.`}
        </p>
      </div>
    )
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
            <h1 className="text-3xl font-bold">Shared Collections</h1>
            <p className="text-muted-foreground mt-1">Collections shared with you</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Shared
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search collections..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            {renderCollections()}
          </TabsContent>

          <TabsContent value="shared">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search shared collections..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            {renderCollections()}
          </TabsContent>

          <TabsContent value="public">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search public collections..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            {renderCollections()}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}
