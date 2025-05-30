"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import LoginModal from "@/components/login-modal";
import SignupModal from "@/components/signup-modal";

export default function Navbar({ isLoggedIn, user, onLoginClick, onSignupClick, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // After mounting, we can access the theme and restore it
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  // Handle theme toggle and persistence
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navLinks = [
    { href: '/pdfs', label: 'PDFs' },
    { href: '/notes', label: 'Notes' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/collections', label: 'Collections' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg border-b border-border/40">
      <div className="absolute inset-0 bg-background/80" />

      <nav className="max-w-7xl mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Hamburger */}
          <div className="flex items-center gap-4">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] sm:w-[350px] backdrop-blur-lg">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link 
                        href={link.href}
                        className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent/50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="text-xl font-bold flex items-center gap-2">
                BraineBase
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation Links */}
          <motion.div
            className="hidden md:flex items-center space-x-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </motion.div>

          {/* Auth Section & Theme Toggle */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

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