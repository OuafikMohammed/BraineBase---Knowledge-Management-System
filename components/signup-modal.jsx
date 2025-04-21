"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function SignupModal({ onClose, onSignup, onGoogleLogin, onLoginClick }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      onSignup(name, email, password)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <AnimatePresence>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] hover:from-[#a67cfc] hover:to-[#7b4fff] text-white transition-all duration-300">
            Sign Up
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-[#1a1333]/95 backdrop-blur-lg border-[#7b4fff]/20 animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Create Your Account</DialogTitle>
              <DialogDescription className="text-[#a0a0c0]">
                Enter your details to create a new account
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#a0a0c0]">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white placeholder:text-[#a0a0c0]/70 focus:border-[#7b4fff] focus:ring-[#7b4fff]/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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
                  placeholder="Create a password"
                  className="bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white placeholder:text-[#a0a0c0]/70 focus:border-[#7b4fff] focus:ring-[#7b4fff]/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] hover:from-[#a67cfc] hover:to-[#7b4fff] text-white transition-all duration-300 transform hover:scale-[1.02]"
              >
                Sign Up
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-[#a0a0c0]">
                Already have an account?{" "}
                <button
                  onClick={onLoginClick}
                  className="text-[#7b4fff] hover:text-[#a67cfc] transition-colors"
                >
                  Login
                </button>
              </p>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
