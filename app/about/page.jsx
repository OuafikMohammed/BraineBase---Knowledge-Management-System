"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState("light")

  // Check for saved theme preference and user data
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Check if user is logged in (mock implementation)
    const mockUser = {
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      status: "Editor",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
    }

    // In a real app, you would check if the user is logged in
    const isUserLoggedIn = true // Mock value

    if (isUserLoggedIn) {
      setUser(mockUser)
      setIsLoggedIn(true)
    }
  }, [])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <div className="min-h-screen">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
        onLogout={() => {}}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">About BrainBase</h1>

        <div className="max-w-3xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>Organize Knowledge, Empower Minds</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                BrainBase was created with a simple yet powerful mission: to help individuals and organizations
                effectively organize their knowledge and make it accessible to those who need it.
              </p>
              <p>
                In today's information-rich world, the ability to quickly find, understand, and utilize knowledge is a
                critical advantage. BrainBase provides the tools to create, organize, and share knowledge in a way that
                empowers everyone in your organization.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                BrainBase began as a solution to a common problem faced by many teams: knowledge silos. Information was
                scattered across emails, documents, and in the minds of team members, making it difficult to find and
                leverage.
              </p>
              <p className="mb-4">
                Our founders experienced this challenge firsthand and set out to create a better way to manage and share
                knowledge. After months of development and testing, BrainBase was born.
              </p>
              <p>
                Today, BrainBase helps teams of all sizes break down knowledge barriers and work more efficiently by
                ensuring everyone has access to the information they need, when they need it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li>
                  <strong>Accessibility:</strong> Knowledge should be accessible to everyone who needs it.
                </li>
                <li>
                  <strong>Clarity:</strong> Information should be clear, concise, and easy to understand.
                </li>
                <li>
                  <strong>Collaboration:</strong> The best knowledge bases are built together.
                </li>
                <li>
                  <strong>Continuous Improvement:</strong> Knowledge is never static; it grows and evolves.
                </li>
                <li>
                  <strong>User-Centered Design:</strong> Our tools are designed with the user's needs at the forefront.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
