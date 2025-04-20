"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { fetchCollaborationData } from "@/lib/api-utils"
import ChartExportMenu from "./chart-export-menu"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

export default function CollaborationTeamParticipation({ dateRange }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Format dates for API
        const from = dateRange.from.toISOString().split("T")[0]
        const to = dateRange.to.toISOString().split("T")[0]

        const result = await fetchCollaborationData(from, to)
        setData(result)

        // Set the first team as selected by default
        if (result.teams.length > 0) {
          setSelectedTeam(result.teams[0].id)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error loading collaboration data:", err)
        setError("Failed to load collaboration data")
        setLoading(false)
      }
    }

    loadData()
  }, [dateRange])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaboration & Team Participation</CardTitle>
          <CardDescription>Analyzing team collaboration patterns</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading collaboration data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collaboration & Team Participation</CardTitle>
          <CardDescription>Analyzing team collaboration patterns</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const selectedTeamData = data.teams.find((team) => team.id === selectedTeam)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Teams</CardTitle>
          <CardDescription>Teams and shared collections you are part of</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.teams.map((team) => (
              <Card
                key={team.id}
                className={`cursor-pointer transition-all ${selectedTeam === team.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedTeam(team.id)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <div className="flex justify-between items-center">
                    <Badge>{team.collaborators.length} members</Badge>
                    <Badge variant="outline">{team.collectionCount} collections</Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTeamData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Composition</CardTitle>
                <CardDescription>Collaborators in {selectedTeamData.name}</CardDescription>
              </div>
              <ChartExportMenu
                data={selectedTeamData.collaborators}
                filename={`team-composition-${selectedTeamData.id}`}
              />
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={selectedTeamData.collaborators}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="contribution"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {selectedTeamData.collaborators.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} contributions`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contribution Breakdown</CardTitle>
                <CardDescription>Contribution ratio per team member</CardDescription>
              </div>
              <ChartExportMenu
                data={selectedTeamData.collaborators}
                filename={`contribution-breakdown-${selectedTeamData.id}`}
              />
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Member</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Access</th>
                      <th className="text-left p-2">Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTeamData.collaborators.map((member) => (
                      <tr key={member.id} className="border-b">
                        <td className="p-2">{member.name}</td>
                        <td className="p-2">{member.role}</td>
                        <td className="p-2">
                          <Badge variant={member.accessLevel === "EDIT" ? "default" : "secondary"}>
                            {member.accessLevel}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{
                                  width: `${(member.contribution / selectedTeamData.totalContributions) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs">{member.contribution}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contribution by Role</CardTitle>
                <CardDescription>Contribution distribution by user role</CardDescription>
              </div>
              <ChartExportMenu
                data={selectedTeamData.collaborators.reduce((acc, member) => {
                  const existingRole = acc.find((r) => r.role === member.role)
                  if (existingRole) {
                    existingRole.contribution += member.contribution
                  } else {
                    acc.push({ role: member.role, contribution: member.contribution })
                  }
                  return acc
                }, [])}
                filename={`contribution-by-role-${selectedTeamData.id}`}
              />
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={selectedTeamData.collaborators.reduce((acc, member) => {
                    const existingRole = acc.find((r) => r.role === member.role)
                    if (existingRole) {
                      existingRole.contribution += member.contribution
                    } else {
                      acc.push({ role: member.role, contribution: member.contribution })
                    }
                    return acc
                  }, [])}
                  margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="role" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="contribution" fill="#8884d8" name="Contributions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
