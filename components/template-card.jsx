"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, FileEdit, BarChart2 } from "lucide-react"
import Link from "next/link"

export default function TemplateCard({ title, icon, description, features }) {
  // Map title to appropriate icon and link
  const getIconAndLink = () => {
    switch (title) {
      case "PDFs":
        return { icon: <FileText className="h-10 w-10 text-[#7b4fff]" />, link: "/pdfs" }
      case "Notes":
        return { icon: <FileEdit className="h-10 w-10 text-[#7b4fff]" />, link: "/notes" }
      case "Analytics":
        return { icon: <BarChart2 className="h-10 w-10 text-[#7b4fff]" />, link: "/analytics" }
      default:
        return { icon: null, link: "#" }
    }
  }

  const { icon: IconComponent, link } = getIconAndLink()
  return (
    <motion.div
      className="p-6 rounded-xl bg-card border border-primary/20 shadow-lg transition-all duration-300 hover:shadow-primary/10 group"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl">{IconComponent}</span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        
        <p className="text-[#a0a0c0] text-sm leading-relaxed">
          {description}
        </p>
        
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center text-sm text-[#a0a0c0]"
            >
              <span className="mr-2 text-[#7b4fff]">•</span>
              {feature}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
