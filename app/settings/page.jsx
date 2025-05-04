"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUserRole } from "@/components/user-role-context"
import api from "@/lib/api"
import { sendPasswordResetCode, verifyResetCode, resetPassword } from "@/lib/auth"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { role } = useUserRole()

  // Profile State
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profileErrors, setProfileErrors] = useState({})
  const [lastSavedName, setLastSavedName] = useState("")
  const [lastSavedEmail, setLastSavedEmail] = useState("")

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState("")

  // Password Reset State
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [resetStep, setResetStep] = useState("email")
  const [resetEmail, setResetEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [resetPassword, setResetPassword] = useState("")
  const [confirmResetPassword, setConfirmResetPassword] = useState("")
  const [resetErrors, setResetErrors] = useState({})

  // Loading State
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/profile')
        setUser(response.data.user)
        setName(response.data.user.name)
        setEmail(response.data.user.email)
        setLastSavedName(response.data.user.name)
        setLastSavedEmail(response.data.user.email)
        
        // Update localStorage with latest user data
        if (response.data.user.id_profile) {
          localStorage.setItem('userId', response.data.user.id_profile)
        }
        if (response.data.user.user_type) {
          localStorage.setItem('userRole', response.data.user.user_type)
        }
        
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Error fetching user data:', error)
        router.push('/login')
      }
    }
    fetchUserData()
  }, [router])

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (password.length === 0) return ""
    if (password.length < 8) return "Weak"
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
    return strength <= 2 ? "Weak" : strength === 3 ? "Medium" : "Strong"
  }

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    if (e) e.preventDefault()
    if (!name || !email) return

    setIsLoading(true)
    setProfileErrors({})

    try {
      const response = await api.put('/profile', { name, email })
      setUser(response.data.user)
      setLastSavedName(name)
      setLastSavedEmail(email)
      
      // Update localStorage with latest user data if provided
      if (response.data.user.id_profile) {
        localStorage.setItem('userId', response.data.user.id_profile)
      }
      if (response.data.user.user_type) {
        localStorage.setItem('userRole', response.data.user.user_type)
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      })
    } catch (error) {
      setProfileErrors(error.response?.data?.errors || { general: 'Failed to update profile' })
      setName(lastSavedName)
      setEmail(lastSavedEmail)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setPasswordErrors({})

    if (newPassword.length < 8) {
      setPasswordErrors({ password: ['Password must be at least 8 characters long'] })
      setIsLoading(false)
      return
    }

    if (checkPasswordStrength(newPassword) === "Weak") {
      setPasswordErrors({ 
        password: ['Password is too weak. Include uppercase, lowercase, numbers, and special characters.'] 
      })
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordErrors({ password_confirmation: ['Passwords do not match'] })
      setIsLoading(false)
      return
    }

    try {
      await api.post('/change-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmNewPassword
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setPasswordStrength("")
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      })
    } catch (error) {
      setPasswordErrors(error.response?.data?.errors || { general: 'Failed to change password' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Password Reset Flow
  const handlePasswordReset = async () => {
    setIsLoading(true)
    setResetErrors({})

    try {
      if (resetStep === "email") {
        if (!resetEmail) {
          setResetErrors({ email: ['Email is required'] })
          return
        }
        await sendPasswordResetCode(resetEmail)
        setResetStep("code")
        toast({
          title: "Code Sent",
          description: "A reset code has been sent to your email.",
        })
      } else if (resetStep === "code") {
        if (!resetCode) {
          setResetErrors({ code: ['Reset code is required'] })
          return
        }
        await verifyResetCode(resetEmail, resetCode)
        setResetStep("newPassword")
      } else if (resetStep === "newPassword") {
        if (resetPassword.length < 8) {
          setResetErrors({ password: ['Password must be at least 8 characters long'] })
          return
        }

        if (checkPasswordStrength(resetPassword) === "Weak") {
          setResetErrors({ 
            password: ['Password is too weak. Include uppercase, lowercase, numbers, and special characters.'] 
          })
          return
        }

        if (resetPassword !== confirmResetPassword) {
          setResetErrors({ password_confirmation: ['Passwords do not match'] })
          return
        }

        await resetPassword(resetEmail, resetCode, resetPassword, confirmResetPassword)
        toast({
          title: "Password Reset",
          description: "Your password has been reset successfully.",
        })
        setShowResetPasswordDialog(false)
        resetPasswordForm()
      }
    } catch (error) {
      setResetErrors(error.errors || { general: error.message || 'An error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPasswordForm = () => {
    setResetStep("email")
    setResetEmail("")
    setResetCode("")
    setResetPassword("")
    setConfirmResetPassword("")
    setResetErrors({})
  }

  if (!isLoggedIn) return null

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-8">

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={profileErrors.name ? "border-red-500" : ""}
                />
                {profileErrors.name && (
                  <p className="text-red-500 text-sm">{profileErrors.name[0]}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={profileErrors.email ? "border-red-500" : ""}
                />
                {profileErrors.email && (
                  <p className="text-red-500 text-sm">{profileErrors.email[0]}</p>
                )}
              </div>

              {/* General Error Message */}
              {profileErrors.general && (
                <p className="text-red-500 text-sm">{profileErrors.general}</p>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setName(lastSavedName)
                    setEmail(lastSavedEmail)
                  }}
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || (name === lastSavedName && email === lastSavedEmail)}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Change your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={passwordErrors.current_password ? "border-red-500" : ""}
                />
                {passwordErrors.current_password && (
                  <p className="text-red-500 text-sm">{passwordErrors.current_password[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordStrength(checkPasswordStrength(e.target.value))
                  }}
                  className={passwordErrors.password ? "border-red-500" : ""}
                />
                {passwordStrength && (
                  <div className={`text-sm ${
                    passwordStrength === "Strong" ? "text-green-500" : 
                    passwordStrength === "Medium" ? "text-yellow-500" : 
                    "text-red-500"
                  }`}>
                    Password Strength: {passwordStrength}
                  </div>
                )}
                {passwordErrors.password && (
                  <p className="text-red-500 text-sm">{passwordErrors.password[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Reset Section */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Forgot your password? Reset it here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowResetPasswordDialog(true)} variant="outline">
              Reset Password
            </Button>
          </CardContent>
        </Card>

        {/* Password Reset Dialog */}
        <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                {resetStep === "email" && "Enter your email to receive a reset code."}
                {resetStep === "code" && "Enter the code sent to your email."}
                {resetStep === "newPassword" && "Enter your new password."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {resetStep === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={resetErrors.email ? "border-red-500" : ""}
                  />
                  {resetErrors.email && (
                    <p className="text-red-500 text-sm">{resetErrors.email[0]}</p>
                  )}
                </div>
              )}

              {resetStep === "code" && (
                <div className="space-y-2">
                  <Label htmlFor="resetCode">Reset Code</Label>
                  <Input
                    id="resetCode"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className={resetErrors.code ? "border-red-500" : ""}
                    maxLength={6}
                  />
                  {resetErrors.code && (
                    <p className="text-red-500 text-sm">{resetErrors.code[0]}</p>
                  )}
                </div>
              )}

              {resetStep === "newPassword" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resetPassword">New Password</Label>
                    <Input
                      id="resetPassword"
                      type="password"
                      value={resetPassword}
                      onChange={(e) => {
                        setResetPassword(e.target.value)
                        setPasswordStrength(checkPasswordStrength(e.target.value))
                      }}
                      className={resetErrors.password ? "border-red-500" : ""}
                    />
                    {passwordStrength && (
                      <div className={`text-sm ${
                        passwordStrength === "Strong" ? "text-green-500" : 
                        passwordStrength === "Medium" ? "text-yellow-500" : 
                        "text-red-500"
                      }`}>
                        Password Strength: {passwordStrength}
                      </div>
                    )}
                    {resetErrors.password && (
                      <p className="text-red-500 text-sm">{resetErrors.password[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmResetPassword">Confirm New Password</Label>
                    <Input
                      id="confirmResetPassword"
                      type="password"
                      value={confirmResetPassword}
                      onChange={(e) => setConfirmResetPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {resetErrors.general && (
                <p className="text-red-500 text-sm text-center">{resetErrors.general}</p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePasswordReset} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}