"use client"

import { useSidebar } from "@/components/sidebar"

export default function MainContent({ children }) {
  const { expanded } = useSidebar()

  return <main className={`w-full transition-all duration-300 ${expanded ? "md:pl-64" : "md:pl-16"}`}>{children}</main>
}
