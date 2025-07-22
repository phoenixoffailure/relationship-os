{
  ;`import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Heart, CalendarDays, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface RelationshipCardProps {
  name: string
  type: string
  members: number
  lastCheckin: string
}

export function RelationshipCard({ name, type, members, lastCheckin }: RelationshipCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{name}</CardTitle>
          <Badge variant="secondary" className="capitalize">{type}</Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Users className="h-4 w-4" /> {members} Members
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <CalendarDays className="h-4 w-4" /> Last Check-in: {lastCheckin}
          </p>
          {/* Placeholder for connection score or recent activity */}
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Heart className="h-4 w-4 text-calm-500" /> Connection Score: 8/10
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent">View Details</Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
`
}
