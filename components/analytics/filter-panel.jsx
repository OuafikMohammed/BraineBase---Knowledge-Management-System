"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FilterPanel() {
  const [filters, setFilters] = useState({
    creatorRole: "all",
    favorites: false,
    category: "all",
  })

  const handleRoleChange = (value) => {
    setFilters({ ...filters, creatorRole: value })
  }

  const handleFavoritesChange = (checked) => {
    setFilters({ ...filters, favorites: checked })
  }

  const handleCategoryChange = (value) => {
    setFilters({ ...filters, category: value })
  }

  const handleReset = () => {
    setFilters({
      creatorRole: "all",
      favorites: false,
      category: "all",
    })
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Creator Role</Label>
            <RadioGroup
              value={filters.creatorRole}
              onValueChange={handleRoleChange}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="role-all" />
                <Label htmlFor="role-all">All Roles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ADMIN" id="role-admin" />
                <Label htmlFor="role-admin">Admin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EDITOR" id="role-editor" />
                <Label htmlFor="role-editor">Editor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="VIEWER" id="role-viewer" />
                <Label htmlFor="role-viewer">Viewer</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filters.category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="RESEARCH">Research</SelectItem>
                <SelectItem value="LEGAL">Legal</SelectItem>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="DESIGN">Design</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="favorites" checked={filters.favorites} onCheckedChange={handleFavoritesChange} />
              <Label htmlFor="favorites">Show favorites only</Label>
            </div>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
