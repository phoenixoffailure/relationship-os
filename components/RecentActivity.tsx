'use client'

import { useRecentActivity } from '../hooks/useRecentActivity'

interface RecentActivityProps {
  userId: string
  limit?: number
}

export default function RecentActivity({ userId, limit = 8 }: RecentActivityProps) {
  const { 
    activities, 
    loading, 
    formatActivityTime, 
    getActivityBgColor 
  } = useRecentActivity(userId, limit)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'journal':
        return (
          <svg className="w-5 h-5 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'checkin':
        return (
          <svg className="w-5 h-5 text-calm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'insight':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case 'relationship':
        return (
          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Loading activity...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 mb-2">No recent activity</p>
        <p className="text-sm text-gray-400">Start journaling or doing check-ins to see your activity here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityBgColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{activity.title}</p>
            {activity.description && (
              <p className="text-sm text-gray-600 truncate">{activity.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{formatActivityTime(activity.time)}</p>
          </div>
          
          {/* Activity-specific indicators */}
          {activity.type === 'checkin' && activity.data?.relationship_id && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span className="text-xs text-gray-500">Shared</span>
            </div>
          )}
          
          {activity.type === 'insight' && (
            <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              {activity.data?.insight_type}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}