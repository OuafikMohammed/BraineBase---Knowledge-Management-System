import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { MoreHorizontal, UserX } from 'lucide-react'
import { collectionService } from '@/lib/collection-service'

export function CollectionMembers({ collectionId, onShareUpdate }) {
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userToRemove, setUserToRemove] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    loadMembers()
  }, [collectionId])

  const loadMembers = async () => {
    try {
      const shares = await collectionService.getShares(collectionId)
      setMembers(shares)
    } catch (error) {
      console.error('Error loading members:', error)
      toast({
        title: "Error",
        description: "Failed to load collection members",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (userId, role) => {
    try {
      await collectionService.updateShare(collectionId, userId, role)
      toast({ description: "Member role updated successfully" })
      loadMembers()
      if (onShareUpdate) {
        onShareUpdate()
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async () => {
    if (!userToRemove) return

    try {
      await collectionService.removeShare(collectionId, userToRemove.id)
      setMembers(members.filter(member => member.user.id !== userToRemove.id))
      toast({ description: "Member removed successfully" })
      if (onShareUpdate) {
        onShareUpdate()
      }
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    } finally {
      setUserToRemove(null)
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'editor':
        return 'Editor'
      case 'viewer':
        return 'Viewer'
      default:
        return role
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading members...</div>
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[300px] rounded-md border p-4">
        {members.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No members yet
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">{member.user.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.user.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {getRoleLabel(member.role)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleUpdateRole(member.user.id, 'viewer')}
                      >
                        Make Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleUpdateRole(member.user.id, 'editor')}
                      >
                        Make Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleUpdateRole(member.user.id, 'admin')}
                      >
                        Make Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={() => setUserToRemove(member.user)}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Remove Access
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <AlertDialog 
        open={!!userToRemove} 
        onOpenChange={() => setUserToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.name} from this collection?
              They will no longer have access to view or edit this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
