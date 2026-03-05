"use client";
import api from "@/lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ResetPasswordModal from "./reset-password-modal";

export default function LoginModal({ onLogin, onSignupClick }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission
    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post("/login", formData);
      // Store the token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      // Store user role and id_profile
      if (response.data.user) {
        localStorage.setItem('userRole', response.data.user.user_type || 'VIEWER');
        if (response.data.user.id_profile) {
          localStorage.setItem('userId', response.data.user.id_profile);
        }
      }
      
      setShowSuccess(true);
      onLogin(response.data);
      
      // Wait for animation to complete before closing and reloading
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 300); // Additional delay for modal close animation
      }, 1500);
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || "Invalid credentials. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-white hover:text-white hover:bg-[#7b4fff]/20 transition-colors">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1333]/95 backdrop-blur-lg border-[#7b4fff]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Welcome Back</DialogTitle>
          <DialogDescription className="text-[#a0a0c0]">
            Enter your credentials to login
          </DialogDescription>
        </DialogHeader>

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
                Logged in successfully!
              </motion.p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#a0a0c0]">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email[0]}</p>}
              </div>

              <div className="space-y-2">                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-[#a0a0c0]">
                    Password
                  </Label>
                  <ResetPasswordModal />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Your password"
                  className={`bg-[#0e0a1a]/50 border-[#7b4fff]/30 text-white ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password[0]}</p>}
              </div>

              {errors.general && (
                <p className="text-red-500 text-sm text-center">{errors.general}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#7b4fff] to-[#a67cfc] text-white mt-4"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <div className="mt-4 text-center">
                <p className="text-[#a0a0c0]">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onSignupClick();
                    }}
                    className="text-[#7b4fff] hover:text-[#a67cfc] transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}