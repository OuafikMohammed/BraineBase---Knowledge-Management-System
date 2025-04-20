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
        return { icon: <FileText className="h-10 w-10 text-black dark:text-white" />, link: "/pdfs" }
      case "Notes":
        return { icon: <FileEdit className="h-10 w-10 text-black dark:text-white" />, link: "/notes" }
      case "Analytics":
        return { icon: <BarChart2 className="h-10 w-10 text-black dark:text-white" />, link: "/analytics" }
      default:
        return { icon: null, link: "#" }
    }
  }

  const { icon: IconComponent, link } = getIconAndLink()

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="h-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">{IconComponent}</div>
          <CardTitle className="text-xl font-bold text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center mb-4">{description}</CardDescription>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <span className="mr-2">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href={link}>Get Started</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
