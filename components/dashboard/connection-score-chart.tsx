{
  ;`'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const data = [
  { name: 'Jan', score: 70 },
  { name: 'Feb', score: 75 },
  { name: 'Mar', score: 72 },
  { name: 'Apr', score: 80 },
  { name: 'May', score: 85 },
  { name: 'Jun', score: 82 },
  { name: 'Jul', score: 88 },
]

export function ConnectionScoreChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: 'var(--radius)' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
`
}
