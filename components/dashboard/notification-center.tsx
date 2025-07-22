{
  ;`import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, CheckCircle, Info, Lightbulb } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function NotificationCenter() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Notifications</CardTitle>
        <Bell className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-mint-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium">Check-in Completed!</p>
            <p className="text-sm text-muted-foreground">Your daily check-in for "My Partner" has been recorded.</p>
            <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-calm-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium">New Insight Available</p>
            <p className="text-sm text-muted-foreground">Consider planning a surprise date for your partner this week.</p>
            <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-medium">Onboarding Reminder</p>
            <p className="text-sm text-muted-foreground">Complete your onboarding to unlock full features.</p>
            <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
          </div>
        </div>
        <Separator />
        <div className="text-center text-muted-foreground text-sm py-2">
          No new notifications.
        </div>
      </CardContent>
    </Card>
  )
}
`
}
