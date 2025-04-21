"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Home, FileText, FileEdit, Settings, Sun, Moon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import RoleSelector from "@/components/role-selector"
import { motion, AnimatePresence } from "framer-motion"
import LoginModal from "@/components/login-modal"
import SignupModal from "@/components/signup-modal"

export default function Navbar({ isLoggedIn, user, onLoginClick, onSignupClick, onLogout, theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b border-[#7b4fff]/20">
      <div className="absolute inset-0 bg-[#0e0a1a]/80" />
      
      <nav className="max-w-7xl mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-xl font-bold text-white">
              BraineBase
            </Link>
          </motion.div>

          <motion.div 
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link href="/pdfs" className="text-[#a0a0c0] hover:text-white transition-colors">
              PDFs
            </Link>
            <Link href="/notes" className="text-[#a0a0c0] hover:text-white transition-colors">
              Notes
            </Link>
            <Link href="/analytics" className="text-[#a0a0c0] hover:text-white transition-colors">
              Analytics
            </Link>
            <Link href="/collections" className="text-[#a0a0c0] hover:text-white transition-colors">
              Collections
            </Link>
          </motion.div>

          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoginModal />
            <SignupModal />
          </motion.div>

          <button
            className="md:hidden text-[#a0a0c0] hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1a1333] rounded-lg mt-2 border border-[#7b4fff]/20">
                <Link
                  href="/pdfs"
                  className="block px-3 py-2 text-[#a0a0c0] hover:text-white hover:bg-[#7b4fff]/10 rounded-md transition-colors"
                >
                  PDFs
                </Link>
                <Link
                  href="/notes"
                  className="block px-3 py-2 text-[#a0a0c0] hover:text-white hover:bg-[#7b4fff]/10 rounded-md transition-colors"
                >
                  Notes
                </Link>
                <Link
                  href="/analytics"
                  className="block px-3 py-2 text-[#a0a0c0] hover:text-white hover:bg-[#7b4fff]/10 rounded-md transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href="/collections"
                  className="block px-3 py-2 text-[#a0a0c0] hover:text-white hover:bg-[#7b4fff]/10 rounded-md transition-colors"
                >
                  Collections
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
