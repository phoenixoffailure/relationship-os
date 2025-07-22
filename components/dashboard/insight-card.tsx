{
  ;`import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Star, Lock, HeartHandshake, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightCardProps {
  title: string
  description: string
  type: 'suggestion' | 'milestone' | 'pattern' | 'appreciation'
  priority: 'low' | 'medium' | 'high'
  isPrivate?: boolean
}

const typeIcons = {
  suggestion: <Lightbulb className="h-5 w-5 text-calm-500" />,
  milestone: <Star className="h-5 w-5 text-yellow-500" />,
  pattern: <Sparkles className="h-5 w-5 text-purple-500" />,
  appreciation: <HeartHandshake className="h-5 w-5 text-pink-500" />,
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export function InsightCard({ title, description, type, priority, isPrivate = false }: InsightCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex-shrink-0">{typeIcons[type]}</div>
        <div className="grid gap-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="ml-auto flex flex-col items-end gap-2">
          <Badge className={cn('capitalize', priorityColors[priority])}>{priority}</Badge>
          {isPrivate && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-calm-100 text-calm-700">
              <Lock className="h-3 w-3" /> Private
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Additional actions or details can go here */}
      </CardContent>
    </Card>
  )
}
`
}
