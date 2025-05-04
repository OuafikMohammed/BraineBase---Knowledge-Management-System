"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  FileText,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Search,
  Globe,
  Lock,
  Users,
  Share2,
  Check,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Import and use the UserRole context
import { useUserRole } from "@/components/user-role-context"
export default function CollectionPage() {
  const params = useParams()
  const router = useRouter()
  const collectionId = params.collectionId
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  const [collection, setCollection] = useState(null)
  const [pdfs, setPdfs] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [pdfToDelete, setPdfToDelete] = useState(null)
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [pdfToModify, setPdfToModify] = useState(null)
  const [newPdfName, setNewPdfName] = useState("")
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [searchUserQuery, setSearchUserQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [isOwner, setIsOwner] = useState(true)
  const [userRole, setUserRole] = useState("VIEWER")
  const [userPermission, setUserPermission] = useState(null)
  const [sharePermission, setSharePermission] = useState("READ")

  // Add this near the top of the component
  const { role, isAdmin, canEditCollection, canDeleteCollection } = useUserRole()

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

  // Update the collection data structure to include owner and proper sharing
  const mockCollections = {
    1: {
      id: 1,
      name: "Favorites",
      description: "Your favorite PDFs",
      visibility: "private",
      sharedWith: [],
      owner: { id: 1, name: "John Doe", avatar: "/placeholder.svg?height=40&width=40", role: "ADMIN" },
    },
    2: {
      id: 2,
      name: "Work Documents",
      description: "Work-related documents",
      visibility: "shared",
      sharedWith: [
        { userId: 2, permission: "READ" },
        { userId: 3, permission: "EDIT" },
      ],
      owner: { id: 1, name: "John Doe", avatar: "/placeholder.svg?height=40&width=40", role: "ADMIN" },
    },
    3: {
      id: 3,
      name: "Personal",
      description: "Personal documents and files",
      visibility: "private",
      sharedWith: [],
      owner: { id: 1, name: "John Doe", avatar: "/placeholder.svg?height=40&width=40", role: "ADMIN" },
    },
    4: {
      id: 4,
      name: "Public Resources",
      description: "Publicly available resources",
      visibility: "public",
      sharedWith: [],
      owner: { id: 1, name: "John Doe", avatar: "/placeholder.svg?height=40&width=40", role: "ADMIN" },
    },
    5: {
      id: 5,
      name: "Project X Research",
      description: "Research materials for Project X",
      visibility: "shared",
      sharedWith: [{ userId: 1, permission: "READ" }],
      owner: { id: 2, name: "Jane Smith", avatar: "/placeholder.svg?height=40&width=40", role: "EDITOR" },
    },
    6: {
      id: 6,
      name: "Marketing Assets",
      description: "Brand assets and marketing materials",
      visibility: "shared",
      sharedWith: [{ userId: 1, permission: "EDIT" }],
      owner: { id: 3, name: "Robert Johnson", avatar: "/placeholder.svg?height=40&width=40", role: "EDITOR" },
    },
  }

  // Mock PDFs data
  const mockPdfs = {
    1: [
      {
        id: 1,
        title: "Knowledge Base Setup Guide",
        description: "A comprehensive guide to setting up your knowledge base",
        date: "2023-12-15",
        size: "2.4 MB",
        category: "Guides",
      },
      {
        id: 3,
        title: "User Management Manual",
        description: "How to manage users and permissions in your knowledge base",
        date: "2023-10-05",
        size: "3.2 MB",
        category: "Manuals",
      },
      {
        id: 5,
        title: "Content Migration Guide",
        description: "How to migrate content from other platforms to BrainBase",
        date: "2023-08-30",
        size: "1.5 MB",
        category: "Guides",
      },
      {
        id: 6,
        title: "Analytics and Reporting",
        description: "Understanding BrainBase analytics and reporting features",
        date: "2023-07-22",
        size: "2.7 MB",
        category: "Features",
      },
      {
        id: 7,
        title: "Mobile App Guide",
        description: "How to use the BrainBase mobile application",
        date: "2023-06-15",
        size: "1.9 MB",
        category: "Guides",
      },
    ],
    2: [
      {
        id: 2,
        title: "Content Organization Best Practices",
        description: "Learn how to organize your content effectively",
        date: "2023-11-20",
        size: "1.8 MB",
        category: "Best Practices",
      },
      {
        id: 4,
        title: "API Documentation",
        description: "Technical documentation for the BrainBase API",
        date: "2023-09-12",
        size: "5.1 MB",
        category: "Technical",
      },
      {
        id: 8,
        title: "Project Timeline",
        description: "Timeline for the BrainBase project implementation",
        date: "2023-05-10",
        size: "3.5 MB",
        category: "Project",
      },
    ],
    3: [
      {
        id: 9,
        title: "Personal Notes",
        description: "Personal notes on knowledge management",
        date: "2023-04-05",
        size: "1.2 MB",
        category: "Notes",
      },
      {
        id: 10,
        title: "Reading List",
        description: "List of books and articles to read",
        date: "2023-03-20",
        size: "0.8 MB",
        category: "Personal",
      },
    ],
    4: [
      {
        id: 11,
        title: "Public Resource 1",
        description: "Publicly available resource",
        date: "2023-02-15",
        size: "2.1 MB",
        category: "Public",
      },
      {
        id: 12,
        title: "Public Resource 2",
        description: "Another publicly available resource",
        date: "2023-01-10",
        size: "1.7 MB",
        category: "Public",
      },
    ],
    5: [
      {
        id: 13,
        title: "Project X Overview",
        description: "Overview of Project X",
        date: "2023-12-01",
        size: "3.0 MB",
        category: "Project",
      },
      {
        id: 14,
        title: "Research Findings",
        description: "Research findings for Project X",
        date: "2023-11-15",
        size: "4.2 MB",
        category: "Research",
      },
    ],
    6: [
      {
        id: 15,
        title: "Brand Guidelines",
        description: "Brand guidelines and assets",
        date: "2023-10-20",
        size: "5.5 MB",
        category: "Marketing",
      },
      {
        id: 16,
        title: "Campaign Materials",
        description: "Materials for the latest marketing campaign",
        date: "2023-09-25",
        size: "3.8 MB",
        category: "Marketing",
      },
    ],
  }

  // Load collection and PDFs data
  useEffect(() => {
    if (collectionId && mockCollections[collectionId]) {
      setCollection(mockCollections[collectionId])
      setPdfs(mockPdfs[collectionId] || [])

      // Check if current user is the owner
      const currentUserId = 1 // Mock current user ID
      setIsOwner(mockCollections[collectionId].owner.id === currentUserId)

      // Set user role (from mock data)
      setUserRole("ADMIN") // This would come from authentication in a real app

      // Determine user permission if not owner
      if (!isOwner) {
        const userShare = mockCollections[collectionId].sharedWith.find((share) =>
          typeof share === "object" ? share.userId === currentUserId : share === currentUserId,
        )
        if (userShare && typeof userShare === "object") {
          setUserPermission(userShare.permission)
        }
      }

      // Initialize selected users
      const sharedUsers = mockCollections[collectionId].sharedWith || []
      setSelectedUsers(sharedUsers.map((share) => (typeof share === "object" ? share.userId : share)))
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Mock user data
    setUser({
      id: 1,
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      status: "Editor",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
    })
    setIsLoggedIn(true)
  }, [collectionId])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Filtered PDFs based on search
  const filteredPDFs = pdfs.filter(
    (pdf) =>
      pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // View PDF
  const handleView = (pdfId) => {
    const pdf = pdfs.find((p) => p.id === pdfId)
    alert(`Viewing: ${pdf.title}`)
  }

  // Download PDF
  const handleDownload = (pdfId) => {
    const pdf = pdfs.find((p) => p.id === pdfId)
    alert(`Downloading: ${pdf.title}`)
  }

  // Delete PDF from collection
  const handleDeletePdf = (pdfId) => {
    setPdfToDelete(pdfId)
    setShowDeleteDialog(true)
  }

  const confirmDeletePdf = () => {
    // Remove PDF from collection
    const updatedPdfs = pdfs.filter((pdf) => pdf.id !== pdfToDelete)
    setPdfs(updatedPdfs)
    setShowDeleteDialog(false)
    setPdfToDelete(null)
  }

  // Modify PDF name
  const handleModifyPdf = (pdfId) => {
    const pdf = pdfs.find((p) => p.id === pdfId)
    setPdfToModify(pdfId)
    setNewPdfName(pdf.title)
    setShowModifyDialog(true)
  }

  const confirmModifyPdf = () => {
    // Update PDF name
    const updatedPdfs = pdfs.map((pdf) => (pdf.id === pdfToModify ? { ...pdf, title: newPdfName } : pdf))
    setPdfs(updatedPdfs)
    setShowModifyDialog(false)
    setPdfToModify(null)
  }

  // Open share dialog
  const handleShareCollection = () => {
    setShowShareDialog(true)
  }

  // Save sharing settings
  const handleSaveSharing = () => {
    setCollection({
      ...collection,
      sharedWith: selectedUsers,
      visibility: selectedUsers.length > 0 ? "shared" : collection.visibility,
    })
    setShowShareDialog(false)
  }

  // Toggle user selection for sharing
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
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

  if (!collection) {
    return (
        <div className="min-h-screen flex flex-col">
          <Navbar
            isLoggedIn={isLoggedIn}
            user={user}
            onLoginClick={() => {}}
            onSignupClick={() => {}}
            onLogout={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/");
            }}
            theme={theme}
            toggleTheme={toggleTheme}
          />

          <div className="flex-grow flex items-center justify-center">
            <p>Loading collection...</p>
          </div>
        </div>
    )
  }

  // Wrap the return statement with ProtectedRoute
  return (
      <div className="min-h-screen flex flex-col">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLoginClick={() => {}}
          onSignupClick={() => {}}
          onLogout={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/");
          }}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <div className="flex-grow container mx-auto py-10 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-2">
                <a href="/collections">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Collections
                </a>
              </Button>
              <div>
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold">{collection.name}</h1>
                  <Badge variant="outline" className="ml-2 flex items-center gap-1">
                    {getVisibilityIcon(collection.visibility)}
                    <span>{getVisibilityLabel(collection.visibility)}</span>
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">{collection.description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwner && (
                <Button variant="outline" onClick={handleShareCollection} className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
              {!isOwner && (
                <div className="flex items-center">
                  <p className="text-sm text-muted-foreground mr-2">Shared by:</p>
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={collection.owner.avatar || "/placeholder.svg"} alt={collection.owner.name} />
                    <AvatarFallback>{collection.owner.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{collection.owner.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search PDFs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPDFs.length > 0 ? (
              filteredPDFs.map((pdf) => (
                <Card key={pdf.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-start text-base">
                      <FileText className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{pdf.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{pdf.description}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Category: {pdf.category}</span>
                      <span>Size: {pdf.size}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span>Added: {pdf.date}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(pdf.id)}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      {/* Update the PDF actions based on user role and permissions */}
                      <DropdownMenuContent align="end">
                        {(isOwner || userRole === "ADMIN" || userPermission === "EDIT") && (
                          <>
                            <DropdownMenuItem onClick={() => handleModifyPdf(pdf.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modify
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePdf(pdf.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from Collection
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={() => handleDownload(pdf.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No PDFs Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "We couldn't find any PDFs matching your search criteria."
                    : "This collection is empty. Add PDFs from the PDFs page."}
                </p>
              </div>
            )}
          </div>

          {collection.sharedWith && collection.sharedWith.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Shared With</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collection.sharedWith.map((share) => {
                  const userId = typeof share === "object" ? share.userId : share
                  const permission = typeof share === "object" ? share.permission : "READ"
                  const sharedUser = mockUsers.find((u) => u.id === userId)
                  if (!sharedUser) return null
                  return (
                    <div key={userId} className="flex items-center p-3 border rounded-md">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={sharedUser.avatar || "/placeholder.svg"} alt={sharedUser.name} />
                        <AvatarFallback>{sharedUser.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{sharedUser.name}</p>
                        <div className="flex items-center">
                          <p className="text-xs text-muted-foreground">{sharedUser.email}</p>
                          <Badge variant="outline" className="ml-2">
                            {permission === "READ" ? (
                              <div className="flex items-center">
                                <Eye className="h-3 w-3 mr-1 text-blue-500" />
                                <span>Read Only</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Edit className="h-3 w-3 mr-1 text-green-500" />
                                <span>Can Edit</span>
                              </div>
                            )}
                          </Badge>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => {
                            setSelectedUsers(selectedUsers.filter((id) => id !== userId))
                            setCollection({
                              ...collection,
                              sharedWith: collection.sharedWith.filter((s) =>
                                typeof s === "object" ? s.userId !== userId : s !== userId,
                              ),
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <Footer />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent aria-describedby="remove-pdf-description">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from Collection?</AlertDialogTitle>
              <AlertDialogDescription id="remove-pdf-description">
                This will remove the PDF from this collection. The PDF will still be available in your library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeletePdf}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modify PDF Dialog */}
        <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
          <DialogContent aria-describedby="modify-pdf-description">
            <DialogHeader>
              <DialogTitle>Rename PDF</DialogTitle>
              <DialogDescription id="modify-pdf-description">Enter a new name for your PDF document.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pdf-name">PDF Name</Label>
                <Input id="pdf-name" value={newPdfName} onChange={(e) => setNewPdfName(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModifyDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmModifyPdf}>Save Changes</Button>
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
                <Label htmlFor="search-users">Search Users</Label>
                <Input
                  id="search-users"
                  placeholder="Search by name or email"
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
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
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
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
              <div className="flex items-center h-5 w-5 rounded-sm border border-primary">
                {selectedUsers.includes(user.id) && <Check className="h-4 w-4 text-primary" />}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div> 
  )
}
