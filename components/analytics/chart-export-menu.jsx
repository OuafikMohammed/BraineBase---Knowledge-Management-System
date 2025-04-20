"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { saveAs } from "file-saver"
import { jsPDF } from "jspdf"

export default function ChartExportMenu({ data, filename }) {
  const handleExport = (format) => {
    if (!data) return

    switch (format) {
      case "csv":
        exportCSV(data, filename)
        break
      case "json":
        exportJSON(data, filename)
        break
      case "pdf":
        exportPDF(data, filename)
        break
      default:
        break
    }
  }

  const exportCSV = (data, filename) => {
    // Convert data to CSV format
    const replacer = (key, value) => (value === null ? "" : value)
    const header = Object.keys(data[0] || {})
    let csv = data.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(","))
    csv.unshift(header.join(","))
    csv = csv.join("\r\n")

    // Create and download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, `${filename}.csv`)
  }

  const exportJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    saveAs(blob, `${filename}.json`)
  }

  const exportPDF = (data, filename) => {
    // In a real app, this would use html2canvas or similar to capture the chart
    // For this example, we'll just create a simple PDF with the data
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(filename, 20, 20)

    doc.setFontSize(12)
    doc.text("Data Export", 20, 30)

    let y = 40
    data.forEach((item, index) => {
      const text = Object.entries(item)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")

      if (y > 280) {
        doc.addPage()
        y = 20
      }

      doc.text(`${index + 1}. ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}`, 20, y)
      y += 10
    })

    doc.save(`${filename}.pdf`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
