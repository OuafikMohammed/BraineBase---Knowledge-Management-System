"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import { ThemeProvider } from "@/components/theme-provider";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    // Check authentication status
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setUser(storedUser);
      }
    }
  }, []);

  const handleLogin = (data) => {
    const { token, user: authUser } = data;
    localStorage.setItem("token", token);
    
    // Store user data consistently
    const userData = {
      name: authUser.name,
      email: authUser.email,
      role: authUser.user_type || "VIEWER",
      id_profile: authUser.id_profile,
      profileImage: "/placeholder.svg?height=40&width=40",
    };
    
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("userId", userData.id_profile);
    
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleSignup = (data) => {
    const { user: authUser } = data;
    
    // Consistent user data structure
    const userData = {
      name: authUser.name,
      email: authUser.email,
      role: authUser.user_type || "VIEWER",
      id_profile: authUser.id_profile,
      profileImage: "/placeholder.svg?height=40&width=40",
    };
    
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("userId", userData.id_profile);
    
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeProvider>
      <main className="min-h-screen">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <HeroSection />
      </main>
    </ThemeProvider>
  );
}