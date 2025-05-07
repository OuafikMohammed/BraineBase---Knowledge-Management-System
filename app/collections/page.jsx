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
  Check,
  X,
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

// Import and use the UserRole context
import { useUserRole } from "@/components/user-role-context"

export default function CollectionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { role } = useUserRole()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

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

  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("my-collections")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [newCollectionVisibility, setNewCollectionVisibility] = useState("private")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCollection, setEditingCollection] = useState(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [collectionToShare, setCollectionToShare] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchUserQuery, setSearchUserQuery] = useState("")
  const [sharePermission, setSharePermission] = useState("READ")

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await fetch("/api/collections", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setCollections(data)
        }
      } catch (error) {
        console.error("Error fetching collections:", error)
        toast({
          title: "Error",
          description: "Failed to load collections",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollections()
  }, [router, toast])

  // Filter collections based on search query and active tab
  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => {
      const matchesSearch =
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase())

      if (activeTab === "my-collections") {
        return matchesSearch && collection.owner.id === parseInt(localStorage.getItem("userId"))
      } else {
        return (
          matchesSearch &&
          collection.sharedWith?.some((share) =>
            typeof share === "object"
              ? share.userId === parseInt(localStorage.getItem("userId"))
              : share === parseInt(localStorage.getItem("userId")),
          )
        )
      }
    })
  }, [collections, searchQuery, activeTab])

  const filteredSharedCollections = useMemo(() => {
    return collections.filter((collection) => {
      const matchesSearch =
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase())

      return (
        matchesSearch &&
        collection.sharedWith?.some((share) =>
          typeof share === "object"
            ? share.userId === parseInt(localStorage.getItem("userId"))
            : share === parseInt(localStorage.getItem("userId")),
        )
      )
    })
  }, [collections, searchQuery])

  // Create new collection
  const handleCreateCollection = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
          visibility: newCollectionVisibility,
        }),
      })

      if (response.ok) {
        const newCollection = await response.json()
        setCollections((prev) => [...prev, newCollection])
        setShowCreateDialog(false)
        setNewCollectionName("")
        setNewCollectionDescription("")
        setNewCollectionVisibility("private")
        toast({
          description: "Collection created successfully",
        })
      }
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
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/collections/${editingCollection.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
          visibility: newCollectionVisibility,
        }),
      })

      if (response.ok) {
        const updatedCollection = await response.json()
        setCollections((prev) =>
          prev.map((collection) =>
            collection.id === editingCollection.id ? updatedCollection : collection,
          ),
        )
        setShowEditDialog(false)
        setEditingCollection(null)
        toast({
          description: "Collection updated successfully",
        })
      }
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
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setCollections((prev) => prev.filter((collection) => collection.id !== collectionId))
        toast({
          description: "Collection deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting collection:", error)
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      })
    }
  }

  // Share collection
  const handleShareCollection = (collection) => {
    setCollectionToShare(collection)
    setSelectedUsers(collection.sharedWith || [])
    setShowShareDialog(true)
  }

  const handleSaveSharing = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/collections/${collectionToShare.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          users: selectedUsers,
          permission: sharePermission,
        }),
      })

      if (response.ok) {
        const updatedCollection = await response.json()
        setCollections((prev) =>
          prev.map((collection) =>
            collection.id === collectionToShare.id ? updatedCollection : collection,
          ),
        )
        setShowShareDialog(false)
        setCollectionToShare(null)
        toast({
          description: "Sharing settings updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating sharing settings:", error)
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive",
      })
    }
  }

  // View collection
  const handleViewCollection = (collectionId) => {
    router.push(`/collections/${collectionId}`)
  }

  // Get visibility icon
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

  // Get visibility label
  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case "public":
        return "Public"
      case "private":
        return "Private"
      case "shared":
        return "Shared"
      default:
        return "Private"
    }
  }

  const handleVisibilityChange = (collectionId, visibility) => {
    const updatedCollections = collections.map((collection) =>
      collection.id === collectionId ? { ...collection, visibility } : collection,
    )
    setCollections(updatedCollections)
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
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground mt-1">Organize your PDFs into collections</p>
          </div>

          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Collection
          </Button>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="my-collections">My Collections</TabsTrigger>
            <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
          </TabsList>

          <TabsContent value="my-collections">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search collections..."
                  className="pl-10"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollections.length > 0 ? (
                filteredCollections.map((collection) => (
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
                            <DropdownMenuItem onClick={() => handleShareCollection(collection)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                {getVisibilityIcon(collection.visibility)}
                                <span className="ml-2">Visibility</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup
                                  value={collection.visibility}
                                  onValueChange={(value) => handleVisibilityChange(collection.id, value)}
                                >
                                  <DropdownMenuRadioItem value="private">
                                    <Lock className="h-4 w-4 mr-2 text-red-500" />
                                    Private
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="shared">
                                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                                    Shared
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="public">
                                    <Globe className="h-4 w-4 mr-2 text-green-500" />
                                    Public
                                  </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditCollection(collection)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteCollection(collection.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
                          <span>{collection.count} documents</span>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getVisibilityIcon(collection.visibility)}
                          <span>{getVisibilityLabel(collection.visibility)}</span>
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => handleViewCollection(collection.id)}>
                        View Collection
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Collections Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "No collections match your search." : "Create your first collection to get started."}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shared-with-me">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSharedCollections.length > 0 ? (
                filteredSharedCollections.map((collection) => (
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
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Shared Collections</h3>
                  <p className="text-muted-foreground">No one has shared any collections with you yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Dialogs */}
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
              <Label htmlFor="collection-visibility">Visibility</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="visibility-private"
                    name="visibility"
                    value="private"
                    checked={newCollectionVisibility === "private"}
                    onChange={() => setNewCollectionVisibility("private")}
                    className="mr-2"
                  />
                  <Label htmlFor="visibility-private" className="flex items-center cursor-pointer">
                    <Lock className="h-4 w-4 mr-1 text-red-500" />
                    Private
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="visibility-shared"
                    name="visibility"
                    value="shared"
                    checked={newCollectionVisibility === "shared"}
                    onChange={() => setNewCollectionVisibility("shared")}
                    className="mr-2"
                  />
                  <Label htmlFor="visibility-shared" className="flex items-center cursor-pointer">
                    <Users className="h-4 w-4 mr-1 text-blue-500" />
                    Shared
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="visibility-public"
                    name="visibility"
                    value="public"
                    checked={newCollectionVisibility === "public"}
                    onChange={() => setNewCollectionVisibility("public")}
                    className="mr-2"
                  />
                  <Label htmlFor="visibility-public" className="flex items-center cursor-pointer">
                    <Globe className="h-4 w-4 mr-1 text-green-500" />
                    Public
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
            <DialogDescription id="edit-collection-description">Update your collection details.</DialogDescription>
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
              <Label htmlFor="edit-visibility">Visibility</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="edit-visibility-private"
                    name="edit-visibility"
                    value="private"
                    checked={newCollectionVisibility === "private"}
                    onChange={() => setNewCollectionVisibility("private")}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-visibility-private" className="flex items-center cursor-pointer">
                    <Lock className="h-4 w-4 mr-1 text-red-500" />
                    Private
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="edit-visibility-shared"
                    name="edit-visibility"
                    value="shared"
                    checked={newCollectionVisibility === "shared"}
                    onChange={() => setNewCollectionVisibility("shared")}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-visibility-shared" className="flex items-center cursor-pointer">
                    <Users className="h-4 w-4 mr-1 text-blue-500" />
                    Shared
                  </Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="edit-visibility-public"
                    name="edit-visibility"
                    value="public"
                    checked={newCollectionVisibility === "public"}
                    onChange={() => setNewCollectionVisibility("public")}
                    className="mr-2"
                  />
                  <Label htmlFor="edit-visibility-public" className="flex items-center cursor-pointer">
                    <Globe className="h-4 w-4 mr-1 text-green-500" />
                    Public
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
            <Button onClick={handleSaveSharing}>Share Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
