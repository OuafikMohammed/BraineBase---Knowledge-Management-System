"use client"

import { useState, useEffect, createContext, useContext } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ChevronLeft, ChevronRight, Home, FileText, FileEdit, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Create a context for the sidebar
const SidebarContext = createContext({
  expanded: true,
  setExpanded: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }) {
  // Get the stored sidebar state from localStorage if available
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Load the sidebar state from localStorage on mount
  useEffect(() => {
    const storedState = localStorage.getItem("sidebar-expanded")
    if (storedState !== null) {
      setExpanded(storedState === "true")
    }
  }, [])

  // Save the sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", expanded.toString())
  }, [expanded])

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  const { expanded, setExpanded, mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/pdfs", label: "PDFs", icon: <FileText className="h-5 w-5" /> },
    { href: "/notes", label: "Notes", icon: <FileEdit className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    image: "/path/to/image.jpg",
  }
  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r backdrop-blur-lg",
        "bg-background/95 border-border/40",
        expanded ? "w-64" : "w-20"
      )}
      initial={{ x: -100, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: expanded ? 256 : 80,
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className={cn(
              "text-xl font-bold transition-all duration-200",
              expanded ? "opacity-100" : "opacity-0 w-0"
            )}>
              BrainBase
            </span>
          </Link>
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {expanded ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </motion.button>
        </div>        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  "hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                  !expanded && "justify-center px-2"
                )}
              >
                <motion.span
                  initial={false}
                  animate={{ 
                    scale: expanded ? 1 : 1.2,
                    marginRight: expanded ? "0.75rem" : "0" 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.span>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          ))}
        </nav>        <div className="border-t border-border/40 p-4">
          <motion.div 
            className="flex items-center space-x-4"
            animate={{ justifyContent: expanded ? "flex-start" : "center" }}
          >
            <motion.div animate={{ scale: expanded ? 1 : 1.2 }}>
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={user?.image} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            {expanded && (
              <motion.div 
                className="min-w-0 flex-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <p className="truncate text-sm font-medium">
                  {user?.name || "Guest"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || "Sign in to access all features"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.aside>
  )
}

export function SidebarTrigger() {
  const { setMobileOpen } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setMobileOpen(true)}
      aria-label="Open sidebar menu"
    >
      <Menu className="h-6 w-6" />
    </Button>
  )
}
