"use client"
import api from "../lib/api"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check } from "lucide-react"

export default function SignupModal({ onClose, onSignup, onLoginClick }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    user_type: 'VIEWER'
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      user_type: value
    });
    if (errors.user_type) {
      setErrors({
        ...errors,
        user_type: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission
    setIsLoading(true);
  
    try {
      const response = await api.post('/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      // Store user data
      if (response.data.user && response.data.user.id_profile) {
        localStorage.setItem('userId', response.data.user.id_profile);
        localStorage.setItem('userRole', response.data.user.user_type || 'VIEWER');
      }

      setShowSuccess(true);
      onSignup(response.data);
      
      // Wait for animation to complete before closing and reloading
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 300); // Additional delay for modal close animation
      }, 1500);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || 'Something went wrong. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] hover:from-[#a67cfc] hover:to-[#7b4fff] text-white transition-all duration-300">
          Sign Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1333]/95 backdrop-blur-lg border-[#7b4fff]/20">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="rounded-full bg-green-500/20 p-3 mb-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <Check className="h-6 w-6 text-green-500" />
                </motion.div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-white text-lg font-semibold"
              >
                Account created successfully!
              </motion.p>
            </motion.div>
          ) : (
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

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#a0a0c0]">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white placeholder:text-[#a0a0c0]/70 focus:border-[#7b4fff] focus:ring-[#7b4fff]/20 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name[0]}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#a0a0c0]">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white placeholder:text-[#a0a0c0]/70 focus:border-[#7b4fff] focus:ring-[#7b4fff]/20 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#a0a0c0]">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white placeholder:text-[#a0a0c0]/70 focus:border-[#7b4fff] focus:ring-[#7b4fff]/20 ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_type" className="text-[#a0a0c0]">Profile Type</Label>
                  <Select 
                    value={formData.user_type} 
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white ${
                      errors.user_type ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Select profile type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0e0a1a] border-[#7b4fff]/30">
                      <SelectItem value="VIEWER" className="hover:bg-[#7b4fff]/20">Viewer</SelectItem>
                      <SelectItem value="EDITOR" className="hover:bg-[#7b4fff]/20">Editor</SelectItem>
                      <SelectItem value="ADMIN" className="hover:bg-[#7b4fff]/20">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.user_type && <p className="text-red-500 text-sm">{errors.user_type[0]}</p>}
                </div>

                {errors.general && (
                  <p className="text-red-500 text-sm text-center">{errors.general}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] hover:from-[#a67cfc] hover:to-[#7b4fff] text-white transition-all duration-300 mt-4"
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-[#a0a0c0]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="text-[#7b4fff] hover:text-[#a67cfc] transition-colors"
                  >
                    Login
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}