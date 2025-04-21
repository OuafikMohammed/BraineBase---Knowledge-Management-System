"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"

export default function LoginModal({ onClose, onLogin, onGoogleLogin, onSignupClick }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      onLogin(email, password)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-[#a0a0c0] hover:text-white hover:bg-[#1a1333] transition-colors">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1333]/95 backdrop-blur-lg border-[#7b4fff]/20 animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Login to Your Account</DialogTitle>
            <DialogDescription className="text-[#a0a0c0]">
              Enter your credentials to access your account
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#a0a0c0]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white placeholder:text-[#a0a0c0]/70 focus:border-[#7b4fff] focus:ring-[#7b4fff]/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#a0a0c0]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white placeholder:text-[#a0a0c0]/70 focus:border-[#7b4fff] focus:ring-[#7b4fff]/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] hover:from-[#a67cfc] hover:to-[#7b4fff] text-white transition-all duration-300 transform hover:scale-[1.02]"
            >
              Login
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[#a0a0c0]">
              Don't have an account?{" "}
              <button
                onClick={onSignupClick}
                className="text-[#7b4fff] hover:text-[#a67cfc] transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
