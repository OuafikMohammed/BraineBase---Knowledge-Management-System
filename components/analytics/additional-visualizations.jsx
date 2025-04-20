"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { fetchAdditionalVisualizationsData } from "@/lib/api-utils"
import ChartExportMenu from "./chart-export-menu"

export default function AdditionalVisualizations({ dateRange }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Format dates for API
        const from = dateRange.from.toISOString().split("T")[0]
        const to = dateRange.to.toISOString().split("T")[0]

        const result = await fetchAdditionalVisualizationsData(from, to)
        setData(result)
        setLoading(false)
      } catch (err) {
        console.error("Error loading additional visualizations data:", err)
        setError("Failed to load additional visualizations data")
        setLoading(false)
      }
    }

    loadData()
  }, [dateRange])

  useEffect(() => {
    if (!canvasRef.current || loading || !data?.wordCloud) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Sort words by value (descending)
    const sortedWords = [...data.wordCloud].sort((a, b) => b.value - a.value)

    // Calculate max and min values for scaling
    const maxValue = Math.max(...data.wordCloud.map((w) => w.value))
    const minValue = Math.min(...data.wordCloud.map((w) => w.value))
    const valueRange = maxValue - minValue

    // Draw words
    let angle = 0
    const angleStep = (Math.PI * 2) / sortedWords.length

    sortedWords.forEach((word, index) => {
      // Scale font size based on value
      const fontSize = 10 + ((word.value - minValue) / valueRange) * 30
      ctx.font = `${fontSize}px Arial`

      // Vary colors
      const hue = (index * 137) % 360 // Golden angle approximation for good distribution
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`

      // Calculate position (spiral layout)
      const radius = 10 + index * 3
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Draw text
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(word.text, x, y)

      // Increment angle
      angle += angleStep
    })
  }, [data, loading])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Additional Visualizations</CardTitle>
          <CardDescription>Word cloud and other insights</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading additional visualizations...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Additional Visualizations</CardTitle>
          <CardDescription>Word cloud and other insights</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>PDF Content Word Cloud</CardTitle>
          <CardDescription>Most common terms in your PDF documents</CardDescription>
        </div>
        <ChartExportMenu data={data.wordCloud} filename="word-cloud" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <canvas ref={canvasRef} width={800} height={500} className="max-w-full h-auto" />
        </div>
      </CardContent>
    </Card>
  )
}
