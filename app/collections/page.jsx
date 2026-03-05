"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Folder,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Globe,
  Lock,
  Users,
  Share2,
  Eye,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useUserRole } from "@/components/user-role-context"
import { collectionService } from "../../lib/collection-service"

export default function CollectionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { role } = useUserRole()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [userId, setUserId] = useState(null)

  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [newCollectionVisibility, setNewCollectionVisibility] = useState("private")

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCollection, setEditingCollection] = useState(null)

  const [showShareDialog, setShowShareDialog] = useState(false)
  const [collectionToShare, setCollectionToShare] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [sharePermission, setSharePermission] = useState("READ")

  // Load user info from localStorage (client-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
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
        setUserId(userId)
      } else {
        router.push("/")
      }
    }
  }, [router])

  // Load collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        console.log('Fetching collections...');
        setIsLoading(true);
        
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const currentUserId = localStorage.getItem('userId');
        console.log('Auth state:', { 
          hasToken: !!token, 
          hasUserId: !!currentUserId 
        });

        if (!token || !currentUserId) {
          console.log('No authentication data found, redirecting to login');
          router.push('/');
          return;
        }

        const data = await collectionService.getAllCollections();
        console.log('Collections fetched:', {
          count: data?.length ?? 0,
          hasData: !!data
        });
        
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack
        });
        
        // Check if error is auth-related
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication error, redirecting to login');
          router.push('/');
          return;
        }

        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load collections",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, [router, toast])

  // Filter only collections owned by the current user or shared with them
  const filteredCollections = useMemo(() => {
    if (!collections || !Array.isArray(collections)) return []
    if (!userId) return []

    return collections.filter((collection) => {
      if (!collection) return false

      const name = collection.name ?? ''
      const description = collection.description ?? ''

      // Search filter
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase())

      // Access check based on visibility
      const hasAccess = 
        collection.created_by === userId || // User is owner
        collection.visibility === "public" || // Collection is public
        (collection.visibility === "shared" && collection.sharedWith?.some(share => 
          typeof share === 'object' 
            ? share.idProfile === userId 
            : share === userId
        )) // Collection is shared with user

      return matchesSearch && hasAccess
    })
  }, [collections, searchQuery, userId])

  // Create new collection
  const handleCreateCollection = async () => {
    try {
      const newCollection = await collectionService.createCollection({
        name: newCollectionName,
        description: newCollectionDescription,
        visibility: newCollectionVisibility,
      })

      setCollections((prev) => [...prev, newCollection])
      setShowCreateDialog(false)
      setNewCollectionName("")
      setNewCollectionDescription("")
      setNewCollectionVisibility("private")

      toast({ description: "Collection created successfully" })
    } catch (error) {
      console.error("Error creating collection:", error)
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      })
    }
  }

  // Edit collection
  const handleEditCollection = (collection) => {
    setEditingCollection(collection)
    setNewCollectionName(collection.name)
    setNewCollectionDescription(collection.description)
    setNewCollectionVisibility(collection.visibility)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    try {
      const updatedCollection = await collectionService.updateCollection(editingCollection.id, {
        name: newCollectionName,
        description: newCollectionDescription,
        visibility: newCollectionVisibility,
      })

      setCollections((prev) =>
        prev.map((c) =>
          c.id === editingCollection.id ? updatedCollection : c
        )
      )

      setShowEditDialog(false)
      setEditingCollection(null)
      toast({ description: "Collection updated successfully" })
    } catch (error) {
      console.error("Error updating collection:", error)
      toast({
        title: "Error",
        description: "Failed to update collection",
        variant: "destructive",
      })
    }
  }

  // Delete collection
  const handleDeleteCollection = async (collectionId) => {
    if (!confirm("Are you sure you want to delete this collection?")) return

    try {
      await collectionService.deleteCollection(collectionId)
      setCollections((prev) =>
        prev.filter((c) => c.id !== collectionId)
      )
      toast({ description: "Collection deleted successfully" })
    } catch (error) {
      console.error("Error deleting collection:", error)
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      })
    }
  }

  // View collection
  const handleViewCollection = (collectionId) => {
    router.push(`/collections/${collectionId}`)
  }

  // Visibility helpers
  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4 text-green-500" />
      case "private":
        return <Lock className="h-4 w-4 text-red-500" />
      case "shared":
        return <Users className="h-4 w-4 text-blue-500" />
      default:
        return <Lock className="h-4 w-4 text-red-500" />
    }
  }

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case "public": return "Public"
      case "private": return "Private"
      case "shared": return "Shared"
      default: return "Private"
    }
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground mt-1">Organize your PDFs into collections</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Collection
          </Button>
        </div>

        {/* Main content */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private
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

          {/* All Collections */}
          <TabsContent value="all">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search collections..."
                  className="pl-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Loading collections...</div>
            ) : filteredCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCollections.map((collection) => (
                  <Card key={collection.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-start text-base">
                          <Folder className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{collection.name}</span>
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCollection(collection)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteCollection(collection.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>{collection.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>{collection.pdfs?.length || 0} documents</span>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getVisibilityIcon(collection.visibility)}
                          <span>{getVisibilityLabel(collection.visibility)}</span>
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewCollection(collection.id)}
                      >
                        View Collection
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Collections Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No collections match your search."
                    : "Create your first collection to get started."}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Private Collections */}
          <TabsContent value="private">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search private collections..."
                  className="pl-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.filter(c => c.visibility === "private").map((collection) => (
                <Card key={collection.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-start text-base">
                        <Folder className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{collection.name}</span>
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCollection(collection)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCollection(collection.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{collection.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{collection.pdfs?.length || 0} documents</span>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getVisibilityIcon(collection.visibility)}
                        <span>{getVisibilityLabel(collection.visibility)}</span>
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewCollection(collection.id)}
                    >
                      View Collection
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Shared Collections */}
          <TabsContent value="shared">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search shared collections..."
                  className="pl-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.filter(c => c.visibility === "shared").map((collection) => (
                <Card key={collection.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-start text-base">
                        <Folder className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{collection.name}</span>
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCollection(collection)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCollection(collection.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{collection.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{collection.pdfs?.length || 0} documents</span>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getVisibilityIcon(collection.visibility)}
                        <span>{getVisibilityLabel(collection.visibility)}</span>
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewCollection(collection.id)}
                    >
                      View Collection
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Public Collections */}
          <TabsContent value="public">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search public collections..."
                  className="pl-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.filter(c => c.visibility === "public").map((collection) => (
                <Card key={collection.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-start text-base">
                        <Folder className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{collection.name}</span>
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCollection(collection)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCollection(collection.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{collection.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{collection.pdfs?.length || 0} documents</span>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getVisibilityIcon(collection.visibility)}
                        <span>{getVisibilityLabel(collection.visibility)}</span>
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewCollection(collection.id)}
                    >
                      View Collection
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Dialogs */}
      {/* Create Collection Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent aria-describedby="create-collection-description">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription id="create-collection-description">
              Create a new collection to organize your PDF documents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                placeholder="Enter collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="collection-description">Description (Optional)</Label>
              <Input
                id="collection-description"
                placeholder="Enter collection description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id="visibility-private"
                    name="visibility"
                    value="private"
                    checked={newCollectionVisibility === "private"}
                    onChange={() => setNewCollectionVisibility("private")}
                    className="peer sr-only"
                  />
                  <Label 
                    htmlFor="visibility-private" 
                    className="flex flex-col items-center justify-center w-full p-4 text-gray-500 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100"
                  >
                    <Lock className="h-6 w-6 mb-2" />
                    <div className="w-full text-center">
                      <div className="font-semibold">Private</div>
                      <div className="text-xs">Only you can access</div>
                    </div>
                  </Label>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id="visibility-shared"
                    name="visibility"
                    value="shared"
                    checked={newCollectionVisibility === "shared"}
                    onChange={() => setNewCollectionVisibility("shared")}
                    className="peer sr-only"
                  />
                  <Label 
                    htmlFor="visibility-shared" 
                    className="flex flex-col items-center justify-center w-full p-4 text-gray-500 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100"
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <div className="w-full text-center">
                      <div className="font-semibold">Shared</div>
                      <div className="text-xs">Specific people can access</div>
                    </div>
                  </Label>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id="visibility-public"
                    name="visibility"
                    value="public"
                    checked={newCollectionVisibility === "public"}
                    onChange={() => setNewCollectionVisibility("public")}
                    className="peer sr-only"
                  />
                  <Label 
                    htmlFor="visibility-public" 
                    className="flex flex-col items-center justify-center w-full p-4 text-gray-500 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100"
                  >
                    <Globe className="h-6 w-6 mb-2" />
                    <div className="w-full text-center">
                      <div className="font-semibold">Public</div>
                      <div className="text-xs">Anyone can view</div>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCollection}>Create Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent aria-describedby="edit-collection-description">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription id="edit-collection-description">
              Update your collection details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Collection Name</Label>
              <Input
                id="edit-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Visibility</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id="edit-visibility-private"
                    name="edit-visibility"
                    value="private"
                    checked={newCollectionVisibility === "private"}
                    onChange={() => setNewCollectionVisibility("private")}
                    className="peer sr-only"
                  />
                  <Label 
                    htmlFor="edit-visibility-private" 
                    className="flex flex-col items-center justify-center w-full p-4 text-gray-500 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100"
                  >
                    <Lock className="h-6 w-6 mb-2" />
                    <div className="w-full text-center">
                      <div className="font-semibold">Private</div>
                      <div className="text-xs">Only you can access</div>
                    </div>
                  </Label>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id="edit-visibility-shared"
                    name="edit-visibility"
                    value="shared"
                    checked={newCollectionVisibility === "shared"}
                    onChange={() => setNewCollectionVisibility("shared")}
                    className="peer sr-only"
                  />
                  <Label 
                    htmlFor="edit-visibility-shared" 
                    className="flex flex-col items-center justify-center w-full p-4 text-gray-500 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100"
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <div className="w-full text-center">
                      <div className="font-semibold">Shared</div>
                      <div className="text-xs">Specific people can access</div>
                    </div>
                  </Label>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="radio"
                    id="edit-visibility-public"
                    name="edit-visibility"
                    value="public"
                    checked={newCollectionVisibility === "public"}
                    onChange={() => setNewCollectionVisibility("public")}
                    className="peer sr-only"
                  />
                  <Label 
                    htmlFor="edit-visibility-public" 
                    className="flex flex-col items-center justify-center w-full p-4 text-gray-500 border border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100"
                  >
                    <Globe className="h-6 w-6 mb-2" />
                    <div className="w-full text-center">
                      <div className="font-semibold">Public</div>
                      <div className="text-xs">Anyone can view</div>
                    </div>
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Collection Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md" aria-describedby="share-collection-description">
          <DialogHeader>
            <DialogTitle>Share Collection</DialogTitle>
            <DialogDescription id="share-collection-description">
              Share your collection with other users.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Collection</Label>
              <div className="flex items-center p-2 border rounded-md">
                <Folder className="h-5 w-5 mr-2" />
                <span className="font-medium">{collectionToShare?.name}</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="share-permission">Permission Level</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="permission-read"
                    name="permission"
                    value="READ"
                    checked={sharePermission === "READ"}
                    onChange={() => setSharePermission("READ")}
                    className="mr-2"
                  />
                  <Label htmlFor="permission-read" className="flex items-center cursor-pointer">
                    <Eye className="h-4 w-4 mr-1 text-blue-500" />
                    Read Only
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="permission-edit"
                    name="permission"
                    value="EDIT"
                    checked={sharePermission === "EDIT"}
                    onChange={() => setSharePermission("EDIT")}
                    className="mr-2"
                  />
                  <Label htmlFor="permission-edit" className="flex items-center cursor-pointer">
                    <Edit className="h-4 w-4 mr-1 text-green-500" />
                    Can Edit
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            {/* <Button onClick={handleSaveSharing}>Share Collection</Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}