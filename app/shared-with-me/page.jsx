"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Folder, FileText, Search, Users, Eye, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function SharedWithMePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  const [searchQuery, setSearchQuery] = useState("")
  const [sharedCollections, setSharedCollections] = useState([])
  const [filteredCollections, setFilteredCollections] = useState([])

  // Mock shared collections
  const mockSharedCollections = [
    {
      id: 5,
      name: "Project X Research",
      description: "Research materials for Project X",
      count: 8,
      owner: { id: 2, name: "Jane Smith", avatar: "/placeholder.svg?height=40&width=40", role: "EDITOR" },
      lastUpdated: "2023-12-01",
      permission: "READ",
    },
    {
      id: 6,
      name: "Marketing Assets",
      description: "Brand assets and marketing materials",
      count: 12,
      owner: { id: 3, name: "Robert Johnson", avatar: "/placeholder.svg?height=40&width=40", role: "EDITOR" },
      lastUpdated: "2023-11-15",
      permission: "EDIT",
    },
    {
      id: 7,
      name: "Client Presentations",
      description: "Presentations for client meetings",
      count: 5,
      owner: { id: 4, name: "Emily Davis", avatar: "/placeholder.svg?height=40&width=40", role: "EDITOR" },
      lastUpdated: "2023-10-20",
      permission: "READ",
    },
    {
      id: 8,
      name: "Development Guidelines",
      description: "Best practices and guidelines for development",
      count: 9,
      owner: { id: 5, name: "Michael Wilson", avatar: "/placeholder.svg?height=40&width=40", role: "ADMIN" },
      lastUpdated: "2023-09-25",
      permission: "EDIT",
    },
  ]

  // Check for saved theme preference and user data
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Check if user is logged in (mock implementation)
    const mockUser = {
      id: 1,
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      status: "Editor",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
    }

    // In a real app, you would check if the user is logged in
    const isUserLoggedIn = true // Mock value

    if (isUserLoggedIn) {
      setUser(mockUser)
      setIsLoggedIn(true)
      setSharedCollections(mockSharedCollections)
      setFilteredCollections(mockSharedCollections)
    }
  }, [])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query) {
      const filtered = sharedCollections.filter(
        (collection) =>
          collection.name.toLowerCase().includes(query.toLowerCase()) ||
          collection.description.toLowerCase().includes(query.toLowerCase()) ||
          collection.owner.name.toLowerCase().includes(query.toLowerCase()),
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
        onLogout={() => {}}
        theme={theme}
        toggleTheme={toggleTheme}
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
                    <Badge variant="outline" className="flex items-center gap-1">
                      {collection.permission === "READ" ? (
                        <>
                          <Eye className="h-3 w-3 text-blue-500" />
                          <span>Read Only</span>
                        </>
                      ) : (
                        <>
                          <Edit className="h-3 w-3 text-green-500" />
                          <span>Can Edit</span>
                        </>
                      )}
                    </Badge>
                  </div>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{collection.count} documents</span>
                    </div>
                    <span>Updated: {formatDate(collection.lastUpdated)}</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <p className="text-xs text-muted-foreground mr-2">Shared by:</p>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={collection.owner.avatar} alt={collection.owner.name} />
                        <AvatarFallback>{collection.owner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{collection.owner.name}</span>
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
