import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, Search, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { collectionService } from '@/lib/collection-service'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function ShareCollectionDialog({ 
  isOpen, 
  onClose, 
  collectionId,
  onShare 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [role, setRole] = useState('view')
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }

    const searchUsers = async () => {
      setIsSearching(true)
      try {
        const response = await collectionService.searchUsers(searchQuery)
        // Filter out already selected users
        const filteredResults = response.filter(
          user => !selectedUsers.some(selected => selected.id === user.id)
        )
        setSearchResults(filteredResults)
      } catch (error) {
        console.error('Error searching users:', error)
        toast({
          title: "Error",
          description: "Failed to search users",
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(searchUsers, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedUsers, toast])

  const handleSelectUser = (user) => {
    setSelectedUsers(prev => [...prev, user])
    setSearchQuery('')
  }

  const handleRemoveUser = (userId) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId))
  }

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast({
        description: "Please select at least one user to share with",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await collectionService.shareCollection(collectionId, {
        users: selectedUsers.map(user => user.id),
        permission: role
      })

      toast({ description: "Collection shared successfully" })
      if (onShare) {
        onShare()
      }
      onClose()
    } catch (error) {
      console.error('Error sharing collection:', error)
      toast({
        title: "Error",
        description: "Failed to share collection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Collection</DialogTitle>
          <DialogDescription>
            Add people to collaborate on this collection
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="users">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="users"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {searchResults.length > 0 && (
              <ScrollArea className="h-[100px] rounded-md border bg-muted/50 p-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-muted"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="flex-grow">{user.name}</span>
                    <span className="text-muted-foreground">{user.email}</span>
                  </button>
                ))}
              </ScrollArea>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="grid gap-2">
              <Label>Selected Users</Label>
              <ScrollArea className="h-[100px] rounded-md border bg-muted/50 p-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{user.name}</span>
                        <span className="ml-2 text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="role">Permission Level</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Viewer (can view and download)</SelectItem>
                <SelectItem value="edit">Editor (can add and remove PDFs)</SelectItem>
                <SelectItem value="admin">Admin (can manage sharing)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isLoading}>
            {isLoading ? (
              "Sharing..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Share
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
