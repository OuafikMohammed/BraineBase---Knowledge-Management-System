"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, FileText, Briefcase } from "lucide-react"

export default function NotesPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")
  const [vaults, setVaults] = useState([
    { id: 1, name: "Personal Notes", description: "My personal notes and ideas", createdAt: "2023-11-15" },
    { id: 2, name: "Work Projects", description: "Documentation and notes for work projects", createdAt: "2023-12-01" },
  ])
  const [newVaultName, setNewVaultName] = useState("")
  const [isCreatingVault, setIsCreatingVault] = useState(false)

  // Check for saved theme preference and user data
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Check if user is logged in (mock implementation)
    const mockUser = {
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
    }
  }, [])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Create new vault
  const handleCreateVault = () => {
    if (!newVaultName.trim()) {
      alert("Please enter a name for your vault")
      return
    }

    const newVault = {
      id: vaults.length > 0 ? Math.max(...vaults.map((v) => v.id)) + 1 : 1,
      name: newVaultName,
      description: "A new vault for your notes",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setVaults([...vaults, newVault])
    setNewVaultName("")
    setIsCreatingVault(false)

    // Navigate to the new vault
    router.push(`/notes/${newVault.id}`)
  }

  // Open vault
  const handleOpenVault = (vaultId) => {
    router.push(`/notes/${vaultId}`)
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
            <h1 className="text-3xl font-bold">Notes</h1>
            <p className="text-muted-foreground mt-1">Create and manage your notes in vaults</p>
          </div>

          <Button onClick={() => setIsCreatingVault(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Vault
          </Button>
        </div>

        {isCreatingVault ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create New Vault</CardTitle>
              <CardDescription>A vault is a secure space to store and organize your notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Vault Name"
                    value={newVaultName}
                    onChange={(e) => setNewVaultName(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreatingVault(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVault}>Create Vault</Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            {vaults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vaults.map((vault) => (
                  <Card
                    key={vault.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleOpenVault(vault.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Briefcase className="h-5 w-5 mr-2" />
                        {vault.name}
                      </CardTitle>
                      <CardDescription>Created on {vault.createdAt}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{vault.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Open Vault
                      </Button>
                    </CardFooter>
                  </Card>
                ))}

                <Card
                  className="cursor-pointer border-dashed hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6"
                  onClick={() => setIsCreatingVault(true)}
                >
                  <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Create New Vault</p>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Create a new space to organize your notes
                  </p>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-muted rounded-full p-4 inline-block mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Vaults Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first vault to start organizing your notes in a Notion-like workspace.
                </p>
                <Button onClick={() => setIsCreatingVault(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Vault
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
