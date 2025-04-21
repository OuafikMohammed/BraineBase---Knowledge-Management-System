"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setEmail("")

      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
    }, 1000)
  }

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#1a1333] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#7b4fff]/20 via-transparent to-[#a67cfc]/20" />
      
      <motion.div 
        className="max-w-4xl mx-auto px-4 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-center mb-8">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Stay Updated
          </motion.h2>
          <motion.p 
            className="text-[#a0a0c0] text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Subscribe to our newsletter for the latest updates and features
          </motion.p>
        </div>

        <motion.form 
          onSubmit={handleSubmit}
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white placeholder:text-[#a0a0c0]/70 focus:border-[#7b4fff] focus:ring-[#7b4fff]/20"
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] hover:from-[#a67cfc] hover:to-[#7b4fff] text-white transition-all duration-300 transform hover:scale-[1.02]"
            >
              Subscribe
            </Button>
          </div>
        </motion.form>
      </motion.div>
    </section>
  )
}
