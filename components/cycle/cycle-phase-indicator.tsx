{
  ;`import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sun, Moon, Droplet, Leaf, Lock } from 'lucide-react'

interface CyclePhaseIndicatorProps {
  currentPhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
  predictedMood?: string
  partnerSuggestion?: string
}

const phaseInfo = {
  menstrual: {
    icon: <Droplet className="h-6 w-6 text-red-500" />,
    color: 'bg-red-100 text-red-700',
    description: 'Energy levels may be lower. Focus on rest and gentle activities.',
  },
  follicular: {
    icon: <Leaf className="h-6 w-6 text-green-500" />,
    color: 'bg-green-100 text-green-700',
    description: 'Energy and mood may be rising. Good time for new beginnings and planning.',
  },
  ovulation: {
    icon: <Sun className="h-6 w-6 text-yellow-500" />,
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Peak energy and social drive. Ideal for communication and connection.',
  },
  luteal: {
    icon: <Moon className="h-6 w-6 text-purple-500" />,
    color: 'bg-purple-100 text-purple-700',
    description: 'Energy may dip, and mood swings are possible. Prioritize self-care and winding down.',
  },
}

export function CyclePhaseIndicator({
  currentPhase = 'follicular', // Default for demonstration
  predictedMood = 'Feeling optimistic and energetic.',
  partnerSuggestion = 'Your partner might be feeling more social and open to new activities this week. Consider planning something fun together!',
}: CyclePhaseIndicatorProps) {
  const info = phaseInfo[currentPhase]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Current Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</CardTitle>
        {info.icon}
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge className={info.color}>{currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</Badge>
        <p className="text-sm text-muted-foreground">{info.description}</p>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-calm-700 flex items-center gap-2">
            Your Predicted Mood <Lock className="h-3 w-3 text-calm-500" />
            <span className="text-xs text-muted-foreground">Private</span>
          </h3>
          <p className="text-sm mt-1">{predictedMood}</p>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-mint-700">Partner Suggestion</h3>
          <p className="text-sm mt-1">{partnerSuggestion}</p>
          <p className="text-xs text-muted-foreground mt-1">
            (This insight is anonymized and shared with your connected partners to help them understand and support you better.)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
`
}
