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
import { Badge } from "@/components/ui/badge"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchCollaboration, fetchRoleCompliance } from "@/lib/api-utils"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

export default function CollaborationMetrics() {
  const [collaborationData, setCollaborationData] = useState([])
  const [complianceData, setComplianceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch collaboration data with fallback
        const collaborationData = await fetchCollaboration()
        setCollaborationData(collaborationData)

        // Fetch compliance data with fallback
        const complianceData = await fetchRoleCompliance()
        setComplianceData(complianceData)

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
      // Export as CSV - example for collaboration data
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "Team,Collections,Collaborators,Contributions\n" +
        collaborationData
          .map((t) => `${t.name},${t.collectionCount},${t.collaborators.length},${t.totalContributions}`)
          .join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "collaboration.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (type === "png") {
      // This would be implemented with a library like html2canvas in a real app
      alert("PNG export would be implemented here")
    }
  }

  // Process collaboration data for visualization
  const teamData = collaborationData.map((team) => ({
    name: team.name,
    collections: team.collectionCount,
    collaborators: team.collaborators.length,
    contributions: team.totalContributions,
  }))

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Collaboration & Team Metrics</CardTitle>
          <CardDescription>Analyze team collaboration and role compliance</CardDescription>
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
          <CardTitle>Collaboration & Team Metrics</CardTitle>
          <CardDescription>Analyze team collaboration and role compliance</CardDescription>
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
          <CardTitle>Collaboration & Team Metrics</CardTitle>
          <CardDescription>Analyze team collaboration and role compliance</CardDescription>
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
        <Tabs defaultValue="teams">
          <TabsList className="mb-4">
            <TabsTrigger value="teams">Team Overview</TabsTrigger>
            <TabsTrigger value="contributions">Contribution Breakdown</TabsTrigger>
            <TabsTrigger value="compliance">Role Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="collections" fill="#8884d8" name="Collections" />
                <Bar dataKey="collaborators" fill="#82ca9d" name="Collaborators" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="contributions" className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collaborationData.slice(0, 2).map((team) => (
                <div key={team.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-2">{team.name}</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={team.collaborators}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="contribution"
                      >
                        {team.collaborators.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, "Contributions"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">Access Levels:</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {team.collaborators.map((user) => (
                        <Badge key={user.id} variant={user.accessLevel === "EDIT" ? "default" : "secondary"}>
                          {user.name}: {user.accessLevel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="h-[400px]">
            <div className="space-y-6">
              {complianceData.map((role) => {
                const percentage = (role.compliant / role.total) * 100
                let variant = "success"
                if (percentage < 85) variant = "destructive"
                else if (percentage < 95) variant = "warning"

                return (
                  <div key={role.role} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-medium">{role.role}</h3>
                      <Badge variant={variant}>{percentage.toFixed(0)}% Compliant</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          variant === "success"
                            ? "bg-green-500"
                            : variant === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {role.compliant} out of {role.total} users compliant with role permissions
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
