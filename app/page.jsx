"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import LoginModal from "@/components/login-modal"
import SignupModal from "@/components/signup-modal"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isSignupOpen, setIsSignupOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  // Mock login function
  const handleLogin = (email, password) => {
    // This would connect to your authentication service
    console.log("Login attempt with:", email, password)
    setIsLoggedIn(true)
    setUser({
      name: "John",
      surname: "Doe",
      email: email,
      status: "Editor",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
    })
    setIsLoginOpen(false)
  }

  // Mock signup function
  const handleSignup = (name, email, password) => {
    // This would connect to your authentication service
    console.log("Signup attempt with:", name, email, password)
    const nameParts = name.split(" ")
    const firstName = nameParts[0]
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ""

    setIsLoggedIn(true)
    setUser({
      name: firstName,
      surname: lastName,
      email: email,
      status: "Viewer",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
    })
    setIsSignupOpen(false)
  }

  // Mock Google login function
  const handleGoogleLogin = () => {
    // This would connect to your Google authentication service
    console.log("Google login attempt")
    setIsLoggedIn(true)
    setUser({
      name: "Google",
      surname: "User",
      email: "user@gmail.com",
      status: "Viewer",
      profileType: "Google",
      profileImage: "/placeholder.svg?height=40&width=40",
    })
    setIsLoginOpen(false)
    setIsSignupOpen(false)
  }

  // Mock logout function
  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
  }

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <ThemeProvider>
      <main className="min-h-screen">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLoginClick={() => setIsLoginOpen(true)}
          onSignupClick={() => setIsSignupOpen(true)}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <HeroSection />

        {isLoginOpen && (
          <LoginModal
            onClose={() => setIsLoginOpen(false)}
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            onSignupClick={() => {
              setIsLoginOpen(false)
              setIsSignupOpen(true)
            }}
          />
        )}

        {isSignupOpen && (
          <SignupModal
            onClose={() => setIsSignupOpen(false)}
            onSignup={handleSignup}
            onGoogleLogin={handleGoogleLogin}
            onLoginClick={() => {
              setIsSignupOpen(false)
              setIsLoginOpen(true)
            }}
          />
        )}
      </main>
    </ThemeProvider>
  )
}
