"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { fetchUserEngagementData } from "@/lib/api-utils"
import ChartExportMenu from "./chart-export-menu"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

export default function UserEngagementHeatmap({ dateRange }) {
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

        const result = await fetchUserEngagementData(from, to)
        setData(result)
        setLoading(false)
      } catch (err) {
        console.error("Error loading user engagement data:", err)
        setError("Failed to load user engagement data")
        setLoading(false)
      }
    }

    loadData()
  }, [dateRange])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Engagement Heatmap</CardTitle>
          <CardDescription>Analyzing user activity patterns</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading user engagement data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Engagement Heatmap</CardTitle>
          <CardDescription>Analyzing user activity patterns</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  // Process data for heatmap
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity Heatmap</CardTitle>
            <CardDescription>User activity by day and hour</CardDescription>
          </div>
          <ChartExportMenu data={data.activityHeatmap} filename="activity-heatmap" />
        </CardHeader>
        <CardContent>
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
              {days.map((day) => (
                <div key={day} className="flex mb-1">
                  <div className="w-20 text-sm font-medium">{day}</div>
                  {hours.map((hour) => {
                    const activityItem = data.activityHeatmap.find((item) => item.day === day && item.hour === hour)
                    const value = activityItem ? activityItem.value : 0
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Activity by Time of Day</CardTitle>
              <CardDescription>User activity distribution by hour</CardDescription>
            </div>
            <ChartExportMenu data={data.activityByHour} filename="activity-by-hour" />
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.activityByHour} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#8884d8" name="Logins" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uploads" stroke="#82ca9d" name="Uploads" />
                <Line type="monotone" dataKey="views" stroke="#ffc658" name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Activity by Day of Week</CardTitle>
              <CardDescription>User activity distribution by weekday</CardDescription>
            </div>
            <ChartExportMenu data={data.activityByDay} filename="activity-by-day" />
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.activityByDay} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#8884d8" name="Logins" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="uploads" stroke="#82ca9d" name="Uploads" />
                <Line type="monotone" dataKey="views" stroke="#ffc658" name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity Evolution Over Time</CardTitle>
            <CardDescription>Trend of user activity over the selected period</CardDescription>
          </div>
          <ChartExportMenu data={data.activityOverTime} filename="activity-evolution" />
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.activityOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="logins" stroke="#8884d8" name="Logins" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="uploads" stroke="#82ca9d" name="Uploads" />
              <Line type="monotone" dataKey="views" stroke="#ffc658" name="Views" />
              <Line type="monotone" dataKey="edits" stroke="#ff8042" name="Edits" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
