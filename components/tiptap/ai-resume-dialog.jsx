"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function AIResumeDialog({ open, onOpenChange, text, onApply }) {
  const [summary, setSummary] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("summarize")

  // Mock AI generation
  const generateAIContent = async () => {
    if (!text) return

    setIsGenerating(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    let result = ""

    if (activeTab === "summarize") {
      // Generate a summary based on the text
      result = `## Summary\n\n${text
        .split(" ")
        .slice(0, text.split(" ").length / 3)
        .join(" ")}...\n\n**Key points:**\n- Important point 1\n- Important point 2\n- Important point 3`
    } else if (activeTab === "expand") {
      // Generate expanded content
      result = `${text}\n\n## Additional Information\n\nThis expands on the original text with more details and context. Here are some additional points to consider:\n\n1. First additional point with more context\n2. Second point expanding on the original content\n3. Third point with supplementary information`
    } else if (activeTab === "rewrite") {
      // Rewrite the content
      result = `## Rewritten Content\n\n${text.split(" ").reverse().join(" ")}\n\nThe above content has been rewritten to improve clarity and flow.`
    }

    setSummary(result)
    setIsGenerating(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
          <DialogDescription>Use AI to enhance your notes</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="summarize" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
            <TabsTrigger value="expand">Expand</TabsTrigger>
            <TabsTrigger value="rewrite">Rewrite</TabsTrigger>
          </TabsList>

          <TabsContent value="summarize">
            <p className="text-sm text-muted-foreground mb-4">Generate a concise summary of the selected text.</p>
          </TabsContent>

          <TabsContent value="expand">
            <p className="text-sm text-muted-foreground mb-4">
              Expand the selected text with additional details and context.
            </p>
          </TabsContent>

          <TabsContent value="rewrite">
            <p className="text-sm text-muted-foreground mb-4">Rewrite the selected text to improve clarity and flow.</p>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Selected Text</h4>
            <div className="border rounded-md p-3 text-sm bg-muted/30 max-h-32 overflow-y-auto">
              {text || "No text selected"}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">AI Generated Content</h4>
            {isGenerating ? (
              <div className="border rounded-md p-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Generating...</span>
              </div>
            ) : summary ? (
              <div className="border rounded-md p-3 text-sm max-h-64 overflow-y-auto">
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-[100px] border-none p-0 focus-visible:ring-0"
                />
              </div>
            ) : (
              <div className="border rounded-md p-8 text-center text-muted-foreground">
                Click "Generate" to create AI content
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="outline" onClick={() => setSummary("")} disabled={!summary || isGenerating}>
            Clear
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={generateAIContent}
              disabled={!text || isGenerating}
              variant={summary ? "outline" : "default"}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
            <Button onClick={() => onApply(summary)} disabled={!summary || isGenerating}>
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
