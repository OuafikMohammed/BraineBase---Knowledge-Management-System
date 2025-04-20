"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchWordCloud } from "@/lib/api-utils"

export default function WordCloud() {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch word cloud data with fallback
        const wordCloudData = await fetchWordCloud()
        setWords(wordCloudData)

        setLoading(false)
      } catch (err) {
        console.error("Error in component:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!canvasRef.current || loading || words.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Sort words by value (descending)
    const sortedWords = [...words].sort((a, b) => b.value - a.value)

    // Calculate max and min values for scaling
    const maxValue = Math.max(...words.map((w) => w.value))
    const minValue = Math.min(...words.map((w) => w.value))
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
  }, [words, loading])

  const handleExport = (type) => {
    if (type === "png" && canvasRef.current) {
      const canvas = canvasRef.current
      const link = document.createElement("a")
      link.download = "word-cloud.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>PDF Content Word Cloud</CardTitle>
          <CardDescription>Most common terms in your PDF documents</CardDescription>
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
          <CardTitle>PDF Content Word Cloud</CardTitle>
          <CardDescription>Most common terms in your PDF documents</CardDescription>
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
          <CardTitle>PDF Content Word Cloud</CardTitle>
          <CardDescription>Most common terms in your PDF documents</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("png")}>
            <Download className="mr-2 h-4 w-4" />
            PNG
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <canvas ref={canvasRef} width={600} height={400} className="max-w-full h-auto"></canvas>
        </div>
      </CardContent>
    </Card>
  )
}
