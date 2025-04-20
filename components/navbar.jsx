"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Home, FileText, FileEdit, Settings, Sun, Moon } from "lucide-react"
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
// Add the RoleSelector component to the navbar
import RoleSelector from "@/components/role-selector"

export default function Navbar({ isLoggedIn, user, onLoginClick, onSignupClick, onLogout, theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="border-b border-gray-200 py-4 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4">
                <Link href="/" className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-accent">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
                <Link href="/pdfs" className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-accent">
                  <FileText className="h-5 w-5" />
                  <span>PDFs</span>
                </Link>
                <Link href="/notes" className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-accent">
                  <FileEdit className="h-5 w-5" />
                  <span>Notes</span>
                </Link>
                <Link href="/settings" className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-accent">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>

                <div className="pt-4 border-t">
                  <Button variant="ghost" className="w-full justify-start" onClick={toggleTheme}>
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-5 w-5 mr-2" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 mr-2" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-12 w-56 md:h-14 md:w-64">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Design%20sans%20titre-bawifzMzXdVvhfZKHg2NStNSC2rZTa.png"
                alt="BrainBase Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-gray-600">
            Home
          </Link>
          <Link href="/pdfs" className="text-sm font-medium hover:text-gray-600">
            PDFs
          </Link>
          <Link href="/notes" className="text-sm font-medium hover:text-gray-600">
            Notes
          </Link>
        </div>

        {/* Auth Buttons or Profile */}
        <div className="flex items-center gap-4">
          <RoleSelector />
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="hidden md:flex">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImage} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>My Knowledge Bases</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={onLoginClick}>
                Log in
              </Button>
              <Button onClick={onSignupClick}>Sign up</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
