"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TemplateCard from "@/components/template-card"
import NewsletterSection from "@/components/newsletter-section"
import Footer from "@/components/footer"

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    // This would connect to your search functionality
  }

  const templates = [
    {
      id: 1,
      title: "PDFs",
      icon: "📄",
      description: "Access and manage your PDF documents with powerful search and organization features.",
      features: ["Full-text search", "Document categorization", "Version history"],
    },
    {
      id: 2,
      title: "Notes",
      icon: "📝",
      description: "Create and organize your notes in a flexible, Notion-like workspace.",
      features: ["Rich text editor", "Folder organization", "Real-time collaboration"],
    },
    {
      id: 3,
      title: "Analytics",
      icon: "📊",
      description: "Gain insights into your knowledge base with comprehensive analytics and visualizations.",
      features: ["Collection insights", "User engagement metrics", "PDF activity tracking"],
    },
  ]

  return (
    <>
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How can we help you?
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Find support articles, setup guides, troubleshooting, FAQs, and more.
          </motion.p>

          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search for articles, guides, and more..."
                className="pl-10 py-6 text-base rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full">
                Search
              </Button>
            </form>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <TemplateCard
                  title={template.title}
                  icon={template.icon}
                  description={template.description}
                  features={template.features}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSection />
      <Footer />
    </>
  )
}
