import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { collectionService } from '@/services/collectionService'
import { Button } from '@/components/ui/button'

export function NotificationButton() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    loadNotifications()
    
    // Set up Echo listener for new notifications
    if (window.Echo) {
      const userId = localStorage.getItem('userId')
      if (userId) {
        window.Echo.private(`App.Models.User.${userId}`)
          .notification((notification) => {
            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)
          })
      }
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const acceptShareRequest = async (notification) => {
    try {
      await collectionService.respondToShare(notification.data.collection_id, notification.id, 'accept');
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      router.push(`/collections/${notification.data.collection_id}`);
      toast({ description: "Collection share request accepted" });
    } catch (error) {
      console.error('Error accepting share request:', error);
      toast({
        title: "Error",
        description: "Failed to accept share request",
        variant: "destructive"
      });
    }
  };

  const declineShareRequest = async (notification) => {
    try {
      await collectionService.respondToShare(notification.data.collection_id, notification.id, 'decline');
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast({ description: "Collection share request declined" });
    } catch (error) {
      console.error('Error declining share request:', error);
      toast({
        title: "Error",
        description: "Failed to decline share request",
        variant: "destructive"
      });
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id)
    }

    if (notification.data.type === 'collection_shared' || 
        notification.data.type === 'collection_role_updated') {
      router.push(`/collections/${notification.data.collection_id}`)
    }
  }

  const getNotificationContent = (notification) => {
    const { data } = notification
    const senderName = data.sender?.name || 'Someone'
    const collectionName = data.collection_name
    const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

    return {
      avatar: data.sender?.profile_image,
      title: data.type === 'collection_shared'
        ? `${senderName} shared "${collectionName}" with you`
        : data.type === 'collection_role_updated'
        ? `${senderName} updated your role in "${collectionName}"`
        : data.message || 'New notification',
      description: data.type === 'collection_shared'
        ? `You now have ${data.permission} access`
        : data.type === 'collection_role_updated'
        ? `Your role was changed from ${data.old_permission} to ${data.new_permission}`
        : '',
      timeAgo,
      showActions: data.type === 'collection_shared' && !notification.read_at
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-accent">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between px-4 py-2">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              No notifications
            </div>
          ) : (
            notifications.map((notification, i) => {
              const { avatar, title, description, timeAgo, showActions } = getNotificationContent(notification)
              return (
                <div key={notification.id}>
                  {i > 0 && <Separator />}
                  <DropdownMenuItem
                    className="px-4 py-3 focus:bg-accent cursor-default"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex gap-3 min-w-0">
                      <Avatar
                        className="h-9 w-9"
                        src={avatar}
                        fallback={title.charAt(0)}
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className={`text-sm leading-none ${!notification.read_at ? 'font-medium' : ''}`}>
                          {title}
                        </p>
                        {description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {timeAgo}
                        </p>
                        {showActions && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => acceptShareRequest(notification)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => declineShareRequest(notification)}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                      {!notification.read_at && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full self-center flex-shrink-0" />
                      )}
                    </div>
                  </DropdownMenuItem>
                </div>
              )
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
