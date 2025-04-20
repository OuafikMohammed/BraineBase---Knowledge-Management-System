"use client"

import { useState, useEffect } from "react"
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

// Import and use the UserRole context
import { useUserRole } from "@/components/user-role-context"

export default function CollectionsPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  // Update the collections state to include user roles and proper sharing structure
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: "Favorites",
      description: "Your favorite PDFs",
      count: 5,
      visibility: "private",
      sharedWith: [],
      owner: { id: 1, name: "John Doe", role: "ADMIN" },
    },
    {
      id: 2,
      name: "Work Documents",
      description: "Work-related documents",
      count: 3,
      visibility: "shared",
      sharedWith: [
        { userId: 2, permission: "READ" },
        { userId: 3, permission: "EDIT" },
      ],
      owner: { id: 1, name: "John Doe", role: "ADMIN" },
    },
    {
      id: 3,
      name: "Personal",
      description: "Personal documents and files",
      count: 2,
      visibility: "private",
      sharedWith: [],
      owner: { id: 1, name: "John Doe", role: "ADMIN" },
    },
    {
      id: 4,
      name: "Public Resources",
      description: "Publicly available resources",
      count: 7,
      visibility: "public",
      sharedWith: [],
      owner: { id: 1, name: "John Doe", role: "ADMIN" },
    },
  ])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [newCollectionVisibility, setNewCollectionVisibility] = useState("private")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [collectionToEdit, setCollectionToEdit] = useState(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editVisibility, setEditVisibility] = useState("private")
  const [filteredCollections, setFilteredCollections] = useState([])
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [collectionToShare, setCollectionToShare] = useState(null)
  const [searchUserQuery, setSearchUserQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [activeTab, setActiveTab] = useState("my-collections")
  const [sharePermission, setSharePermission] = useState("READ")

  // Mock users data
  const mockUsers = [
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com", avatar: "/placeholder.svg?height=40&width=40" },
    {
      id: 3,
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    { id: 4, name: "Emily Davis", email: "emily.davis@example.com", avatar: "/placeholder.svg?height=40&width=40" },
    {
      id: 5,
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  // Mock shared collections
  const sharedWithMeCollections = [
    {
      id: 5,
      name: "Project X Research",
      description: "Research materials for Project X",
      count: 8,
      owner: { id: 2, name: "Jane Smith", avatar: "/placeholder.svg?height=40&width=40" },
    },
    {
      id: 6,
      name: "Marketing Assets",
      description: "Brand assets and marketing materials",
      count: 12,
      owner: { id: 3, name: "Robert Johnson", avatar: "/placeholder.svg?height=40&width=40" },
    },
  ]

  // Add this near the top of the component
  const { role, isAdmin, isEditor, canCreateCollection } = useUserRole()

  // Check for saved theme preference and user data
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Check if user is logged in (mock implementation)
    // Update the mock user data to include roles
    const mockUser = {
      id: 1,
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      status: "ADMIN",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
    }

    // In a real app, you would check if the user is logged in
    const isUserLoggedIn = true // Mock value

    if (isUserLoggedIn) {
      setUser(mockUser)
      setIsLoggedIn(true)
    }

    // Initialize filteredCollections with all collections
    setFilteredCollections(collections)
  }, [])

  // Update filtered collections when collections change
  useEffect(() => {
    setFilteredCollections(collections)
  }, [collections])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Create new collection
  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      alert("Please enter a name for your collection")
      return
    }

    const newCollection = {
      id: Math.max(...collections.map((c) => c.id)) + 1,
      name: newCollectionName,
      description: newCollectionDescription || "No description",
      count: 0,
      visibility: newCollectionVisibility,
      sharedWith: [],
    }

    setCollections([...collections, newCollection])
    setNewCollectionName("")
    setNewCollectionDescription("")
    setNewCollectionVisibility("private")
    setShowCreateDialog(false)
  }

  // Edit collection
  const handleEditCollection = (collection) => {
    setCollectionToEdit(collection)
    setEditName(collection.name)
    setEditDescription(collection.description)
    setEditVisibility(collection.visibility)
    setShowEditDialog(true)
  }

  // Save edited collection
  const handleSaveEdit = () => {
    if (!editName.trim()) {
      alert("Please enter a name for your collection")
      return
    }

    const updatedCollections = collections.map((collection) =>
      collection.id === collectionToEdit.id
        ? {
            ...collection,
            name: editName,
            description: editDescription,
            visibility: editVisibility,
          }
        : collection,
    )

    setCollections(updatedCollections)
    setShowEditDialog(false)
  }

  // Delete collection
  const handleDeleteCollection = (collectionId) => {
    if (!confirm("Are you sure you want to delete this collection?")) return

    const updatedCollections = collections.filter((collection) => collection.id !== collectionId)
    setCollections(updatedCollections)
  }

  // View collection
  const handleViewCollection = (collectionId) => {
    router.push(`/collections/${collectionId}`)
  }

  // Open share dialog
  const handleShareCollection = (collection) => {
    setCollectionToShare(collection)
    setSelectedUsers(collection.sharedWith || [])
    setShowShareDialog(true)
  }

  // Save sharing settings
  const handleSaveSharing = () => {
    const updatedCollections = collections.map((collection) =>
      collection.id === collectionToShare.id
        ? {
            ...collection,
            sharedWith: selectedUsers.map((userId) => ({
              userId,
              permission: sharePermission,
            })),
            visibility: selectedUsers.length > 0 ? "shared" : collection.visibility,
          }
        : collection,
    )

    setCollections(updatedCollections)
    setShowShareDialog(false)
  }

  // Toggle user selection for sharing
  const toggleUserSelection = (userId) => {
    if (selectedUsers.some((u) => u.userId === userId || u === userId)) {
      setSelectedUsers(selectedUsers.filter((u) => (typeof u === "object" ? u.userId !== userId : u !== userId)))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  // Filter users based on search query
  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchUserQuery.toLowerCase()),
  )

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
        {/* Update the create collection button to be conditionally rendered based on role */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground mt-1">Organize your PDFs into collections</p>
          </div>

          {canCreateCollection && (
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Collection
            </Button>
          )}
        </div>

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
                  onChange={(e) => {
                    const query = e.target.value.toLowerCase()
                    if (query) {
                      const filtered = collections.filter(
                        (collection) =>
                          collection.name.toLowerCase().includes(query) ||
                          collection.description.toLowerCase().includes(query),
                      )
                      setFilteredCollections(filtered)
                    } else {
                      setFilteredCollections(collections)
                    }
                  }}
                />
              </div>
            </div>

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
                                onValueChange={(value) => {
                                  const updatedCollections = collections.map((c) =>
                                    c.id === collection.id ? { ...c, visibility: value } : c,
                                  )
                                  setCollections(updatedCollections)
                                }}
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
                    {collection.sharedWith && collection.sharedWith.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-1">Shared with:</p>
                        <div className="flex -space-x-2 overflow-hidden">
                          {collection.sharedWith.map((share) => {
                            const userId = typeof share === "object" ? share.userId : share
                            const sharedUser = mockUsers.find((u) => u.id === userId)
                            if (!sharedUser) return null
                            return (
                              <div key={userId} className="relative">
                                <Avatar className="h-6 w-6 border-2 border-background">
                                  <AvatarImage src={sharedUser.avatar} alt={sharedUser.name} />
                                  <AvatarFallback>{sharedUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {typeof share === "object" && (
                                  <span className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                                    {share.permission === "READ" ? (
                                      <Eye className="h-3 w-3 text-blue-500" />
                                    ) : (
                                      <Edit className="h-3 w-3 text-green-500" />
                                    )}
                                  </span>
                                )}
                              </div>
                            )
                          })}
                          {collection.sharedWith.length > 3 && (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs">
                              +{collection.sharedWith.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleViewCollection(collection.id)}>
                      View Collection
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <Card
                className="cursor-pointer border-dashed hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Create New Collection</p>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Organize your PDFs into custom collections
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shared-with-me">
            {sharedWithMeCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedWithMeCollections.map((collection) => (
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
                <p className="text-muted-foreground">No one has shared any collections with you yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

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
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
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
                    checked={editVisibility === "private"}
                    onChange={() => setEditVisibility("private")}
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
                    checked={editVisibility === "shared"}
                    onChange={() => setEditVisibility("shared")}
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
                    checked={editVisibility === "public"}
                    onChange={() => setEditVisibility("public")}
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
              <Label htmlFor="search-users">Search Users</Label>
              <Input
                id="search-users"
                placeholder="Search by name or email"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
              />
            </div>
            <div className="border rounded-md overflow-hidden">
              <div className="p-2 bg-muted font-medium">Users</div>
              <div className="max-h-60 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center h-5 w-5 rounded-sm border border-primary">
                        {selectedUsers.includes(user.id) && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No users found</div>
                )}
              </div>
            </div>
            {selectedUsers.length > 0 && (
              <div>
                <Label className="mb-2 block">Selected Users ({selectedUsers.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((userId) => {
                    const user = mockUsers.find((u) => u.id === userId)
                    if (!user) return null
                    return (
                      <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                        <span>{user.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleUserSelection(userId)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-2 mt-4">
            <Label>Permission Level</Label>
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
