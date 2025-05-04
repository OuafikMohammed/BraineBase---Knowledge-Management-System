"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Home, FileText, FileEdit, Settings, Sun, Moon, X, LogOut, Database, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import LoginModal from "@/components/login-modal";
import SignupModal from "@/components/signup-modal";

export default function Navbar({ isLoggedIn, user, onLoginClick, onSignupClick, onLogout, theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b border-[#7b4fff]/20">
      <div className="absolute inset-0 bg-[#0e0a1a]/80" />

      <nav className="max-w-7xl mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Desktop Navigation Links */}
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

          {/* Auth Section */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!isLoggedIn ? (
              <div className="space-x-2">
                <LoginModal onLogin={onLoginClick} onSignupClick={onSignupClick} />
                <SignupModal onSignup={onSignupClick} onLoginClick={onLoginClick} />
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="ml-2"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
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
  );
}