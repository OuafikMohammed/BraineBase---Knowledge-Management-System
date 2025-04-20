"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Lock, PaintBucket, Save, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [theme, setTheme] = useState("light")
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Add these state variables at the top of the component
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [resetStep, setResetStep] = useState("email") // 'email', 'code', 'newPassword'
  const [resetEmail, setResetEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Check for saved theme preference and user data
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    // Mock user data - in a real app, this would come from your auth system
    const mockUser = {
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      status: "Editor",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=100&width=100",
    }

    setUser(mockUser)
    setEmail(mockUser.email)
    setIsLoggedIn(true)
  }, [])

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  // Mock save profile function
  const handleSaveProfile = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Show success message
      alert("Profile updated successfully")
    }, 1000)
  }

  // Mock password change function
  const handleChangePassword = (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      // Show success message
      alert("Password changed successfully")
    }, 1000)
  }

  // Add these functions
  const handleSendVerificationCode = () => {
    setIsLoading(true)
    // Simulate API call to send verification code
    setTimeout(() => {
      setIsLoading(false)
      setResetStep("code")
      // Show success message
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
    }, 1500)
  }

  const handleVerifyCode = () => {
    setIsLoading(true)
    // Simulate API call to verify code
    setTimeout(() => {
      setIsLoading(false)
      setResetStep("newPassword")
    }, 1500)
  }

  const handleResetPassword = () => {
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match")
      return
    }

    setIsLoading(true)
    // Simulate API call to reset password
    setTimeout(() => {
      setIsLoading(false)
      setShowResetPasswordDialog(false)
      setResetStep("email")
      setNewPassword("")
      setConfirmNewPassword("")
      setVerificationCode("")
      // Show success message
      alert("Password has been reset successfully")
    }, 1500)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we load your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
        onLogout={() => router.push("/")}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile Information</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Account Settings</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <PaintBucket className="h-4 w-4" />
              <span>Theme</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.profileImage} alt={`${user.name} ${user.surname}`} />
                      <AvatarFallback>
                        {user.name.charAt(0)}
                        {user.surname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      id="profile-photo"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        // In a real app, this would upload the file to your server
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            setUser({
                              ...user,
                              profileImage: event.target.result,
                            })
                          }
                          reader.readAsDataURL(e.target.files[0])
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("profile-photo").click()}
                    >
                      Change Photo
                    </Button>
                  </div>

                  <div className="grid gap-4 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name (Nom)</Label>
                        <Input id="name" defaultValue={user.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="surname">Surname (Prenom)</Label>
                        <Input id="surname" defaultValue={user.surname} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-email">Email</Label>
                      <Input id="profile-email" defaultValue={user.email} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Input id="status" defaultValue={user.status} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profileType">Profile Type</Label>
                        <Input id="profileType" defaultValue={user.profileType} readOnly />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={isLoading} className="ml-auto flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account email and password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-email">Email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="account-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline">Verify</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Password</h3>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setShowResetPasswordDialog(true)}>
                      Forgot password?
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input type="password" value="••••••••" disabled className="bg-muted" />
                    </div>
                    <Button onClick={() => setShowResetPasswordDialog(true)}>Change Password</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize the appearance of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-medium">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <button
                    className={`block w-full text-left ${theme === "light" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => {
                      setTheme("light")
                      localStorage.setItem("theme", "light")
                      document.documentElement.classList.remove("dark")
                    }}
                  >
                    <Card className="border">
                      <CardHeader className="bg-white text-black">
                        <CardTitle className="text-center">Light Mode</CardTitle>
                      </CardHeader>
                      <CardContent className="h-40 bg-white">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-full max-w-xs">
                            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>

                  <button
                    className={`block w-full text-left ${theme === "dark" ? "ring-2 ring-primary" : ""}`}
                    onClick={() => {
                      setTheme("dark")
                      localStorage.setItem("theme", "dark")
                      document.documentElement.classList.add("dark")
                    }}
                  >
                    <Card className="border">
                      <CardHeader className="bg-gray-900 text-white">
                        <CardTitle className="text-center">Dark Mode</CardTitle>
                      </CardHeader>
                      <CardContent className="h-40 bg-gray-900">
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-full max-w-xs">
                            <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 w-5/6 bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Your theme preference will be saved for your next visit.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center z-50 animate-in slide-in-from-top">
          <div className="mr-3">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <p className="font-bold">Success!</p>
            <p className="text-sm">Verification code has been sent to your email.</p>
          </div>
        </div>
      )}

      {/* Password Reset Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent
          className="sm:max-w-md"
          aria-describedby={
            resetStep === "email"
              ? "reset-email-description"
              : resetStep === "code"
                ? "reset-code-description"
                : "reset-password-description"
          }
        >
          <DialogHeader>
            <DialogTitle>
              {resetStep === "email" && "Reset Password"}
              {resetStep === "code" && "Enter Verification Code"}
              {resetStep === "newPassword" && "Create New Password"}
            </DialogTitle>
            <DialogDescription
              id={
                resetStep === "email"
                  ? "reset-email-description"
                  : resetStep === "code"
                    ? "reset-code-description"
                    : "reset-password-description"
              }
            >
              {resetStep === "email" && "We'll send a verification code to your email."}
              {resetStep === "code" && "Enter the code that was sent to your email."}
              {resetStep === "newPassword" && "Create a new password for your account."}
            </DialogDescription>
          </DialogHeader>

          {resetStep === "email" && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail || email}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSendVerificationCode} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Code"}
                </Button>
              </DialogFooter>
            </>
          )}

          {resetStep === "code" && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-center text-sm">
                  We've sent a verification code to <strong>{resetEmail || email}</strong>
                </p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetStep("email")}>
                  Back
                </Button>
                <Button type="button" onClick={handleVerifyCode} disabled={isLoading || verificationCode.length !== 6}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </DialogFooter>
            </>
          )}

          {resetStep === "newPassword" && (
            <>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setResetStep("code")}>
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isLoading || !newPassword || !confirmNewPassword}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
