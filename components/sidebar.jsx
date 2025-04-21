"use client"

import { useState, useEffect, createContext, useContext } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, Home, FileText, FileEdit, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { motion } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

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
      className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#7b4fff]/20 bg-[#1a1333]/95 backdrop-blur-lg"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">BrainBase</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-[#a0a0c0] hover:bg-[#7b4fff]/10 hover:text-white transition-colors md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? "bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] text-white"
                    : "text-[#a0a0c0] hover:bg-[#7b4fff]/10 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="border-t border-[#7b4fff]/20 p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-8 w-8 bg-[#7b4fff]/20">
              <AvatarImage src={user?.image} />
              <AvatarFallback className="text-white bg-gradient-to-br from-[#7b4fff] to-[#a67cfc]">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "Guest"}
              </p>
              <p className="truncate text-xs text-[#a0a0c0]">
                {user?.email || "Sign in to access all features"}
              </p>
            </div>
          </div>
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
