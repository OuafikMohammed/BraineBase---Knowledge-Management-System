"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchPdfsByCategory, fetchActivityOverTime, fetchPdfReuse } from "@/lib/api-utils"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

export default function PdfActivity() {
  const [pdfsByCategory, setPdfsByCategory] = useState([])
  const [activityOverTime, setActivityOverTime] = useState([])
  const [pdfReuse, setPdfReuse] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch PDFs by category data with fallback
        const pdfsByCategoryData = await fetchPdfsByCategory()
        setPdfsByCategory(pdfsByCategoryData)

        // Fetch activity over time data with fallback
        const activityData = await fetchActivityOverTime()
        setActivityOverTime(activityData)

        // Fetch PDF reuse data with fallback
        const pdfReuseData = await fetchPdfReuse()
        setPdfReuse(pdfReuseData)

        setLoading(false)
      } catch (err) {
        console.error("Error in component:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleExport = (type) => {
    // In a real app, this would trigger the export functionality
    if (type === "csv") {
      // Export as CSV - example for activity data
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "Date,Uploads,Views,Edits\n" +
        activityOverTime.map((a) => `${a.date},${a.uploads},${a.views},${a.edits}`).join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "activity.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (type === "png") {
      // This would be implemented with a library like html2canvas in a real app
      alert("PNG export would be implemented here")
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>PDF Activity Metrics</CardTitle>
          <CardDescription>Track PDF usage and activity over time</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>PDF Activity Metrics</CardTitle>
          <CardDescription>Track PDF usage and activity over time</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="text-destructive">Error loading data: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>PDF Activity Metrics</CardTitle>
          <CardDescription>Track PDF usage and activity over time</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("png")}>
            <Download className="mr-2 h-4 w-4" />
            PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="category">
          <TabsList className="mb-4">
            <TabsTrigger value="category">PDFs by Category</TabsTrigger>
            <TabsTrigger value="activity">Activity Over Time</TabsTrigger>
            <TabsTrigger value="reuse">PDF Reuse</TabsTrigger>
          </TabsList>

          <TabsContent value="category" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pdfsByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(pdfsByCategory[0] || {})
                  .filter((key) => key !== "name")
                  .map((key, index) => (
                    <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="activity" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="uploads" stroke="#8884d8" name="Uploads" />
                <Line type="monotone" dataKey="views" stroke="#82ca9d" name="Views" />
                <Line type="monotone" dataKey="edits" stroke="#ffc658" name="Edits" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="reuse" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pdfReuse} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="collections" fill="#8884d8" name="Collections" />
                <Bar dataKey="views" fill="#82ca9d" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
