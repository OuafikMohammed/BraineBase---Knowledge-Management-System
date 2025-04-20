"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
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
import { fetchPdfActivityMetrics } from "@/lib/api-utils"
import ChartExportMenu from "./chart-export-menu"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

export default function PdfActivityMetrics({ dateRange }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Format dates for API
        const from = dateRange.from.toISOString().split("T")[0]
        const to = dateRange.to.toISOString().split("T")[0]

        const result = await fetchPdfActivityMetrics(from, to)
        setData(result)
        setLoading(false)
      } catch (err) {
        console.error("Error loading PDF activity metrics:", err)
        setError("Failed to load PDF activity data")
        setLoading(false)
      }
    }

    loadData()
  }, [dateRange])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PDF Activity Metrics</CardTitle>
          <CardDescription>Analyzing PDF usage and activity patterns</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading PDF activity data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PDF Activity Metrics</CardTitle>
          <CardDescription>Analyzing PDF usage and activity patterns</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>PDFs by Category</CardTitle>
            <CardDescription>Total PDFs added per category over time</CardDescription>
          </div>
          <ChartExportMenu data={data.pdfsByCategory} filename="pdfs-by-category" />
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.pdfsByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data.pdfsByCategory[0] || {})
                .filter((key) => key !== "month")
                .map((category, index) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={COLORS[index % COLORS.length]}
                    name={category}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Users who uploaded the most PDFs</CardDescription>
          </div>
          <ChartExportMenu data={data.topContributors} filename="top-contributors" />
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.topContributors}
              margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="uploads" fill="#8884d8" name="Uploads" />
              <Bar dataKey="edits" fill="#82ca9d" name="Edits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>PDF Reuse Frequency</CardTitle>
            <CardDescription>How often PDFs are reused across collections</CardDescription>
          </div>
          <ChartExportMenu data={data.pdfReuse} filename="pdf-reuse-frequency" />
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.pdfReuse}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.pdfReuse.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} PDFs`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Favorite vs. General Use</CardTitle>
            <CardDescription>Ratio of favorited PDFs vs. general use</CardDescription>
          </div>
          <ChartExportMenu data={data.favoriteVsGeneral} filename="favorite-vs-general" />
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.favoriteVsGeneral}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={140}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#0088FE" />
                <Cell fill="#00C49F" />
              </Pie>
              <Tooltip formatter={(value) => [`${value} PDFs`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
