'use client'

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"

interface AnimatedCardProps {
  title: string
  action?: 'create' | 'read' | 'update' | 'delete'
  delay?: 1 | 2 | 3 | 4
  children?: React.ReactNode
  onClick?: () => void
}

export function AnimatedCard({ 
  title, 
  action = 'read',
  delay = 1,
  children,
  onClick 
}: AnimatedCardProps) {
  const gradientClass = action ? `gradient-${action}` : ''
  const staggerClass = `stagger-${delay}`
  
  return (
    <div className={`animate-fade-up ${staggerClass}`}>
      <Card className="hover-glow overflow-hidden">
        <div className={`h-2 ${gradientClass}`} />
        <CardHeader>
          <CardTitle className="gradient-text">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          {onClick && (
            <Button 
              onClick={onClick}
              className="button-glow w-full bg-gradient-primary"
            >
              Learn More
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}