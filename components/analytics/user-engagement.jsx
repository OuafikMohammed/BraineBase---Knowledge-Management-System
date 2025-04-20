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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchTopContributors, fetchFavoritesByRole, fetchActivityHeatmap } from "@/lib/api-utils"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

export default function UserEngagement() {
  const [contributors, setContributors] = useState([])
  const [favoritesByRole, setFavoritesByRole] = useState([])
  const [activityHeatmap, setActivityHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch top contributors data with fallback
        const contributorsData = await fetchTopContributors()
        setContributors(contributorsData)

        // Fetch favorites by role data with fallback
        const favoritesData = await fetchFavoritesByRole()
        setFavoritesByRole(favoritesData)

        // Fetch activity heatmap data with fallback
        const heatmapData = await fetchActivityHeatmap()
        setActivityHeatmap(heatmapData)

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
      // Export as CSV - example for contributors data
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "Name,Uploads,Edits,Role\n" +
        contributors.map((c) => `${c.name},${c.uploads},${c.edits},${c.role}`).join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "contributors.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (type === "png") {
      // This would be implemented with a library like html2canvas in a real app
      alert("PNG export would be implemented here")
    }
  }

  // Process heatmap data for visualization
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const heatmapData = days.map((day) => {
    const dayData = { day }
    hours.forEach((hour) => {
      const hourData = activityHeatmap.find((d) => d.day === day && d.hour === hour)
      dayData[`${hour}`] = hourData ? hourData.value : 0
    })
    return dayData
  })

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>Analyze user activity and engagement patterns</CardDescription>
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
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>Analyze user activity and engagement patterns</CardDescription>
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
          <CardTitle>User Engagement</CardTitle>
          <CardDescription>Analyze user activity and engagement patterns</CardDescription>
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
        <Tabs defaultValue="contributors">
          <TabsList className="mb-4">
            <TabsTrigger value="contributors">Top Contributors</TabsTrigger>
            <TabsTrigger value="favorites">Favorites by Role</TabsTrigger>
            <TabsTrigger value="heatmap">Activity Heatmap</TabsTrigger>
          </TabsList>

          <TabsContent value="contributors" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributors} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="uploads" fill="#8884d8" name="Uploads" />
                <Bar dataKey="edits" fill="#82ca9d" name="Edits" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="favorites" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={favoritesByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {favoritesByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, "Favorites"]} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="heatmap" className="h-[400px]">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="flex mb-2">
                  <div className="w-20"></div>
                  {hours.map((hour) => (
                    <div key={hour} className="flex-1 text-center text-xs">
                      {hour}:00
                    </div>
                  ))}
                </div>
                {days.map((day, dayIndex) => (
                  <div key={day} className="flex mb-1">
                    <div className="w-20 text-sm font-medium">{day}</div>
                    {hours.map((hour) => {
                      const value = heatmapData[dayIndex][`${hour}`]
                      let bgColor = "bg-gray-100"
                      if (value > 0) {
                        if (value < 3) bgColor = "bg-green-100"
                        else if (value < 6) bgColor = "bg-green-300"
                        else if (value < 9) bgColor = "bg-green-500"
                        else bgColor = "bg-green-700"
                      }
                      return (
                        <div
                          key={hour}
                          className={`flex-1 h-8 ${bgColor} border border-white`}
                          title={`${day} ${hour}:00 - Activity: ${value}`}
                        ></div>
                      )
                    })}
                  </div>
                ))}
                <div className="flex items-center justify-end mt-4">
                  <div className="text-xs mr-2">Activity Level:</div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-100 mr-1"></div>
                    <div className="text-xs mr-2">None</div>
                    <div className="w-4 h-4 bg-green-100 mr-1"></div>
                    <div className="text-xs mr-2">Low</div>
                    <div className="w-4 h-4 bg-green-300 mr-1"></div>
                    <div className="text-xs mr-2">Medium</div>
                    <div className="w-4 h-4 bg-green-500 mr-1"></div>
                    <div className="text-xs mr-2">High</div>
                    <div className="w-4 h-4 bg-green-700 mr-1"></div>
                    <div className="text-xs">Very High</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
