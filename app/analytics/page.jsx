"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Filter, RefreshCw } from "lucide-react"
import CollectionInsightsDashboard from "@/components/analytics/collection-insights-dashboard"
import CollaborationTeamParticipation from "@/components/analytics/collaboration-team-participation"
import PdfActivityMetrics from "@/components/analytics/pdf-activity-metrics"
import UserEngagementHeatmap from "@/components/analytics/user-engagement-heatmap"
import AdditionalVisualizations from "@/components/analytics/additional-visualizations"
import DateRangePicker from "@/components/analytics/date-range-picker"
import FilterPanel from "@/components/analytics/filter-panel"

export default function AnalyticsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // In a real app, this would trigger a data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your knowledge base usage and activity</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {showFilters && <FilterPanel />}

      <Tabs defaultValue="collections" className="space-y-6">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="collections">Collection Insights</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration & Teams</TabsTrigger>
          <TabsTrigger value="pdf-activity">PDF Activity</TabsTrigger>
          <TabsTrigger value="user-engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="additional">Additional Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-6">
          <CollectionInsightsDashboard dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <CollaborationTeamParticipation dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="pdf-activity" className="space-y-6">
          <PdfActivityMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="user-engagement" className="space-y-6">
          <UserEngagementHeatmap dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="additional" className="space-y-6">
          <AdditionalVisualizations dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
