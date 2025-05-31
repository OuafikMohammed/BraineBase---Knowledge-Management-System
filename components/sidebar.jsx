"use client"

import { useState, useEffect, createContext, useContext } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { ChevronLeft, ChevronRight, Home, FileText, FileEdit, Settings, BarChart2, FolderArchive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Create a context for the sidebar
const SidebarContext = createContext({
  expanded: true,
  setExpanded: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(true)

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
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar() {
  const { expanded, setExpanded } = useSidebar()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/pdfs", label: "PDFs", icon: <FileText className="h-5 w-5" /> },
    { href: "/notes", label: "Notes", icon: <FileEdit className="h-5 w-5" /> },
    { href: "/collections", label: "Collections", icon: <FolderArchive className="h-5 w-5" /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart2 className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r backdrop-blur-lg",
        "bg-background/95 border-border/40",
        expanded ? "w-64" : "w-20",
        "transition-all duration-300 ease-in-out"
      )}
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
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 rounded-lg px-3 py-2",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                "transition-colors duration-200"
              )}
            >
              {item.icon}
              <span className={cn(
                "transition-all duration-200",
                expanded ? "opacity-100" : "opacity-0 w-0"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t px-4 py-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <span className={cn(
              "transition-all duration-200",
              expanded ? "opacity-100" : "opacity-0 w-0"
            )}>
              Toggle Theme
            </span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
