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
    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post("/login", formData);
      setShowSuccess(true);
      // Show success message for 1.5s before closing
      await new Promise(resolve => setTimeout(resolve, 1500));
      onLogin(response.data);
      setIsOpen(false);
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: error.response?.data?.message || "Invalid credentials. Please try again.",
        });
      }
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
              <div className="rounded-full bg-green-500/20 p-3 mb-4">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-white text-lg font-semibold">Logged in successfully!</p>
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#a0a0c0]">
                  Password
                </Label>
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