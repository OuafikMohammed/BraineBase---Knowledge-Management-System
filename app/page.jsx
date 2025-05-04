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
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      console.log("User is already logged in.");
    }
  }, []);

  const handleLogin = (data) => {
    console.log("Handle login called with data:", data);
    const { token, user } = data;
    localStorage.setItem("token", token);
    // Store user role and id_profile
    if (user) {
      localStorage.setItem("userRole", user.user_type || "VIEWER");
      if (user.id_profile) {
        localStorage.setItem("userId", user.id_profile);
      }
    }
    setIsLoggedIn(true);
    setUser({
      name: user.name,
      email: user.email,
      status: user.user_type || "Viewer",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
      id_profile: user.id_profile
    });
    console.log("User logged in successfully:", user);
  };

  const handleSignup = (data) => {
    console.log("Handle signup called with data:", data);
    const { user } = data;
    const nameParts = user.name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    // Store user role and id_profile
    localStorage.setItem("userRole", user.user_type || "VIEWER");
    if (user.id_profile) {
      localStorage.setItem("userId", user.id_profile);
    }

    setIsLoggedIn(true);
    setUser({
      name: firstName,
      surname: lastName,
      email: user.email,
      status: user.user_type || "Viewer",
      profileType: "Standard",
      profileImage: "/placeholder.svg?height=40&width=40",
      id_profile: user.id_profile
    });
    console.log("User signed up successfully:", { firstName, lastName, email: user.email });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    console.log("User logged out successfully.");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    console.log("Theme toggled to:", newTheme);
  };

  return (
    <ThemeProvider>
      <main className="min-h-screen">
        <Navbar
          isLoggedIn={isLoggedIn}
          user={user}
          onLoginClick={handleLogin}
          onSignupClick={handleSignup}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <HeroSection />
      </main>
    </ThemeProvider>
  );
}