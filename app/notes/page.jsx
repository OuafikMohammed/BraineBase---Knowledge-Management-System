"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserRole } from "@/components/user-role-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FolderPlus, File, Folder, ChevronRight } from "lucide-react"

export default function NotesPage() {
  const router = useRouter()
  const { role, isAdmin, isEditor } = useUserRole()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("dark")
  
  // Vault states
  const [vaults, setVaults] = useState([])
  const [selectedVault, setSelectedVault] = useState(null)
  const [isCreatingVault, setIsCreatingVault] = useState(false)
  const [newVaultName, setNewVaultName] = useState("")
  const [newVaultDescription, setNewVaultDescription] = useState("")

  // Note states
  const [notes, setNotes] = useState([])
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Get user data from localStorage
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (token && savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsLoggedIn(true)
      
      // Load user's vaults
      const savedVaults = localStorage.getItem(`vaults_${userData.id}`)
      if (savedVaults) {
        setVaults(JSON.parse(savedVaults))
      }
    } else {
      router.push("/")
    }
  }, [router])

  // Create new vault
  const handleCreateVault = () => {
    if (!newVaultName.trim()) {
      alert("Please enter a vault name")
      return
    }

    const newVault = {
      id: Date.now(),
      name: newVaultName.trim(),
      description: newVaultDescription.trim(),
      createdAt: new Date().toISOString(),
      userId: user.id,
      notes: []
    }

    const updatedVaults = [...vaults, newVault]
    setVaults(updatedVaults)
    localStorage.setItem(`vaults_${user.id}`, JSON.stringify(updatedVaults))
    
    setNewVaultName("")
    setNewVaultDescription("")
    setIsCreatingVault(false)
  }

  // Create new note
  const handleCreateNote = () => {
    if (!selectedVault) {
      alert("Please select a vault first")
      return
    }

    if (!newNoteTitle.trim()) {
      alert("Please enter a note title")
      return
    }

    const newNote = {
      id: Date.now(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedVaults = vaults.map(vault => {
      if (vault.id === selectedVault.id) {
        return {
          ...vault,
          notes: [...vault.notes, newNote]
        }
      }
      return vault
    })

    setVaults(updatedVaults)
    localStorage.setItem(`vaults_${user.id}`, JSON.stringify(updatedVaults))
    
    setNewNoteTitle("")
    setNewNoteContent("")
    setIsCreatingNote(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={() => router.push("/")}
        theme={theme}
        toggleTheme={() => {
          const newTheme = theme === "light" ? "dark" : "light"
          setTheme(newTheme)
          localStorage.setItem("theme", newTheme)
          document.documentElement.classList.toggle("dark", newTheme === "dark")
        }}
      />

      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="text-muted-foreground mt-1">
              Organize your notes in vaults
            </p>
          </div>
          <Dialog open={isCreatingVault} onOpenChange={setIsCreatingVault}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Vault
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Vault</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newVaultName}
                    onChange={(e) => setNewVaultName(e.target.value)}
                    placeholder="Enter vault name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newVaultDescription}
                    onChange={(e) => setNewVaultDescription(e.target.value)}
                    placeholder="Enter vault description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingVault(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateVault}>Create Vault</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <Card
              key={vault.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedVault(vault)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {vault.name}
                </CardTitle>
                <CardDescription>{vault.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {vault.notes.length} notes
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Created {new Date(vault.createdAt).toLocaleDateString()}
                </p>
                <ChevronRight className="h-4 w-4" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {selectedVault && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedVault.name}</h2>
                <p className="text-muted-foreground">{selectedVault.description}</p>
              </div>
              <Dialog open={isCreatingNote} onOpenChange={setIsCreatingNote}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Note</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        placeholder="Enter note title"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        placeholder="Enter note content"
                        rows={5}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingNote(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateNote}>Create Note</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedVault.notes.map((note) => (
                <Card key={note.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <File className="h-5 w-5" />
                      {note.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      Last updated {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
