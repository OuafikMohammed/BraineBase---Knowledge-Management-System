"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchCollections, fetchCollectionAccessTypes } from "@/lib/api-utils"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

export default function CollectionInsights() {
  const [collections, setCollections] = useState([])
  const [accessTypes, setAccessTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch collections data with fallback
        const collectionsData = await fetchCollections()
        setCollections(collectionsData)

        // Fetch access types data with fallback
        const accessTypesData = await fetchCollectionAccessTypes()
        setAccessTypes(accessTypesData)

        setLoading(false)
      } catch (err) {
        console.error("Error in component:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Top collections by PDF count
  const topCollections = [...collections].sort((a, b) => b.pdfCount - a.pdfCount).slice(0, 10)

  // Collections by category
  const collectionsByCategory = collections.reduce((acc, collection) => {
    const existingCategory = acc.find((c) => c.name === collection.category)
    if (existingCategory) {
      existingCategory.count += 1
    } else if (collection.category) {
      acc.push({
        name: collection.category,
        count: 1,
        color: COLORS[acc.length % COLORS.length],
      })
    }
    return acc
  }, [])

  // Collections by visibility
  const collectionsByVisibility = [
    { name: "Private", value: collections.filter((c) => c.visibility === "PRIVATE").length },
    { name: "Shared", value: collections.filter((c) => c.visibility === "SHARED").length },
    { name: "Public", value: collections.filter((c) => c.visibility === "PUBLIC").length },
  ]

  const handleExport = (type) => {
    // In a real app, this would trigger the export functionality
    if (type === "csv") {
      // Export as CSV
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "Name,PDF Count,Category,Visibility\n" +
        collections.map((c) => `${c.name},${c.pdfCount},${c.category || ""},${c.visibility || ""}`).join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "collections.csv")
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
          <CardTitle>Collection Insights</CardTitle>
          <CardDescription>Analyze your collections by various metrics</CardDescription>
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
          <CardTitle>Collection Insights</CardTitle>
          <CardDescription>Analyze your collections by various metrics</CardDescription>
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
          <CardTitle>Collection Insights</CardTitle>
          <CardDescription>Analyze your collections by various metrics</CardDescription>
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
        <Tabs defaultValue="top">
          <TabsList className="mb-4">
            <TabsTrigger value="top">Top Collections</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="visibility">By Visibility</TabsTrigger>
            <TabsTrigger value="access">Access Types</TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCollections} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, "PDF Count"]}
                  labelFormatter={(label) => `Collection: ${label}`}
                />
                <Bar dataKey="pdfCount" fill="#8884d8" name="PDF Count" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="category" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionsByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, "Collection Count"]}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Bar dataKey="count" name="Collection Count">
                  {collectionsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="visibility" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={collectionsByVisibility}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {collectionsByVisibility.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, "Collections"]} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="access" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accessTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {accessTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, "Collections"]} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
