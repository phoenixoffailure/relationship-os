// lib/ui/relationship-aware-icons.ts
// Phase 7.3: Universal icon system that adapts to relationship context
// Replaces romantic assumptions (hearts everywhere) with context-appropriate icons

import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { 
  Heart, 
  Briefcase, 
  Home, 
  Users, 
  HelpCircle,
  MessageCircle,
  Calendar,
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle,
  Lightbulb,
  Settings,
  Activity
} from 'lucide-react'

export interface RelationshipIcon {
  id: string
  emoji: string
  color: string
  LucideIcon: React.ComponentType<{ className?: string }>
}

export interface RelationshipIconSet {
  primary: RelationshipIcon
  checkin: RelationshipIcon
  insights: RelationshipIcon
  connection: RelationshipIcon
  growth: RelationshipIcon
  celebration: RelationshipIcon
}

// Relationship-specific icon sets
export const RELATIONSHIP_ICON_SETS: Record<RelationshipType, RelationshipIconSet> = {
  romantic: {
    primary: { id: 'romantic-primary', emoji: '💕', color: 'text-pink-500', LucideIcon: Heart },
    checkin: { id: 'romantic-checkin', emoji: '💖', color: 'text-pink-500', LucideIcon: Heart },
    insights: { id: 'romantic-insights', emoji: '💝', color: 'text-pink-500', LucideIcon: Lightbulb },
    connection: { id: 'romantic-connection', emoji: '💕', color: 'text-pink-500', LucideIcon: Heart },
    growth: { id: 'romantic-growth', emoji: '🌹', color: 'text-pink-500', LucideIcon: TrendingUp },
    celebration: { id: 'romantic-celebration', emoji: '💖', color: 'text-pink-500', LucideIcon: Heart }
  },
  
  work: {
    primary: { id: 'work-primary', emoji: '💼', color: 'text-blue-600', LucideIcon: Briefcase },
    checkin: { id: 'work-checkin', emoji: '📊', color: 'text-blue-600', LucideIcon: BarChart3 },
    insights: { id: 'work-insights', emoji: '💡', color: 'text-blue-600', LucideIcon: Lightbulb },
    connection: { id: 'work-connection', emoji: '🤝', color: 'text-blue-600', LucideIcon: Users },
    growth: { id: 'work-growth', emoji: '📈', color: 'text-blue-600', LucideIcon: TrendingUp },
    celebration: { id: 'work-celebration', emoji: '🎯', color: 'text-blue-600', LucideIcon: Target }
  },
  
  family: {
    primary: { id: 'family-primary', emoji: '🏠', color: 'text-green-600', LucideIcon: Home },
    checkin: { id: 'family-checkin', emoji: '🏡', color: 'text-green-600', LucideIcon: MessageCircle },
    insights: { id: 'family-insights', emoji: '🌱', color: 'text-green-600', LucideIcon: Lightbulb },
    connection: { id: 'family-connection', emoji: '🤗', color: 'text-green-600', LucideIcon: Users },
    growth: { id: 'family-growth', emoji: '🌳', color: 'text-green-600', LucideIcon: TrendingUp },
    celebration: { id: 'family-celebration', emoji: '🎉', color: 'text-green-600', LucideIcon: CheckCircle }
  },
  
  friend: {
    primary: { id: 'friend-primary', emoji: '👫', color: 'text-orange-500', LucideIcon: Users },
    checkin: { id: 'friend-checkin', emoji: '💬', color: 'text-orange-500', LucideIcon: MessageCircle },
    insights: { id: 'friend-insights', emoji: '✨', color: 'text-orange-500', LucideIcon: Lightbulb },
    connection: { id: 'friend-connection', emoji: '🤝', color: 'text-orange-500', LucideIcon: Users },
    growth: { id: 'friend-growth', emoji: '🚀', color: 'text-orange-500', LucideIcon: TrendingUp },
    celebration: { id: 'friend-celebration', emoji: '🎊', color: 'text-orange-500', LucideIcon: CheckCircle }
  },
  
  other: {
    primary: { id: 'other-primary', emoji: '❤️', color: 'text-purple-500', LucideIcon: HelpCircle },
    checkin: { id: 'other-checkin', emoji: '💭', color: 'text-purple-500', LucideIcon: MessageCircle },
    insights: { id: 'other-insights', emoji: '🔍', color: 'text-purple-500', LucideIcon: Lightbulb },
    connection: { id: 'other-connection', emoji: '🤝', color: 'text-purple-500', LucideIcon: Users },
    growth: { id: 'other-growth', emoji: '📊', color: 'text-purple-500', LucideIcon: TrendingUp },
    celebration: { id: 'other-celebration', emoji: '⭐', color: 'text-purple-500', LucideIcon: CheckCircle }
  }
}

// Utility functions for getting relationship-appropriate icons

export function getRelationshipIconSet(relationshipType: RelationshipType): RelationshipIconSet {
  return RELATIONSHIP_ICON_SETS[relationshipType] || RELATIONSHIP_ICON_SETS.other
}

export function getRelationshipIcon(relationshipType: RelationshipType, iconType: keyof RelationshipIconSet): RelationshipIcon {
  return getRelationshipIconSet(relationshipType)[iconType]
}

// Universal check-in icon that adapts to relationship type
export function getCheckinIcon(relationshipType: RelationshipType): RelationshipIcon {
  return getRelationshipIcon(relationshipType, 'checkin')
}

// Universal connection icon that adapts to relationship type
export function getConnectionIcon(relationshipType: RelationshipType): RelationshipIcon {
  return getRelationshipIcon(relationshipType, 'connection')
}

// Universal insights icon that adapts to relationship type
export function getInsightsIcon(relationshipType: RelationshipType): RelationshipIcon {
  return getRelationshipIcon(relationshipType, 'insights')
}

// Universal growth icon that adapts to relationship type  
export function getGrowthIcon(relationshipType: RelationshipType): RelationshipIcon {
  return getRelationshipIcon(relationshipType, 'growth')
}

// Universal celebration icon that adapts to relationship type
export function getCelebrationIcon(relationshipType: RelationshipType): RelationshipIcon {
  return getRelationshipIcon(relationshipType, 'celebration')
}

// Context-aware icon selection for multi-relationship scenarios
export function getContextualIcon(
  relationshipTypes: RelationshipType[], 
  iconType: keyof RelationshipIconSet,
  fallbackType: RelationshipType = 'other'
): RelationshipIcon {
  // If single relationship type, use its icon
  if (relationshipTypes.length === 1) {
    return getRelationshipIcon(relationshipTypes[0], iconType)
  }
  
  // For mixed relationship types, use priority order:
  // 1. Romantic (most specific)
  // 2. Work (professional boundaries)
  // 3. Family (important relationships)
  // 4. Friend (casual)
  // 5. Other (fallback)
  
  const priorityOrder: RelationshipType[] = ['romantic', 'work', 'family', 'friend', 'other']
  
  for (const priority of priorityOrder) {
    if (relationshipTypes.includes(priority)) {
      return getRelationshipIcon(priority, iconType)
    }
  }
  
  return getRelationshipIcon(fallbackType, iconType)
}

// Get appropriate colors for relationship types
export function getRelationshipColors(relationshipType: RelationshipType) {
  const iconSet = getRelationshipIconSet(relationshipType)
  
  return {
    primary: iconSet.primary.color,
    bg: getBackgroundColor(relationshipType),
    border: getBorderColor(relationshipType),
    hover: getHoverColor(relationshipType)
  }
}

function getBackgroundColor(relationshipType: RelationshipType): string {
  switch (relationshipType) {
    case 'romantic': return 'bg-pink-50'
    case 'work': return 'bg-blue-50'
    case 'family': return 'bg-green-50'
    case 'friend': return 'bg-orange-50'
    case 'other': return 'bg-purple-50'
    default: return 'bg-gray-50'
  }
}

function getBorderColor(relationshipType: RelationshipType): string {
  switch (relationshipType) {
    case 'romantic': return 'border-pink-200'
    case 'work': return 'border-blue-200'
    case 'family': return 'border-green-200'
    case 'friend': return 'border-orange-200'
    case 'other': return 'border-purple-200'
    default: return 'border-gray-200'
  }
}

function getHoverColor(relationshipType: RelationshipType): string {
  switch (relationshipType) {
    case 'romantic': return 'hover:bg-pink-100'
    case 'work': return 'hover:bg-blue-100'
    case 'family': return 'hover:bg-green-100'
    case 'friend': return 'hover:bg-orange-100'
    case 'other': return 'hover:bg-purple-100'
    default: return 'hover:bg-gray-100'
  }
}

// React component for rendering relationship-aware icons
interface RelationshipIconProps {
  relationshipType: RelationshipType
  iconType: keyof RelationshipIconSet
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showEmoji?: boolean
  showLucide?: boolean
  className?: string
}

export function RelationshipIconComponent({ 
  relationshipType, 
  iconType, 
  size = 'md',
  showEmoji = true,
  showLucide = false,
  className = ''
}: RelationshipIconProps) {
  const icon = getRelationshipIcon(relationshipType, iconType)
  const sizeClasses = {
    xs: 'w-3 h-3 text-xs',
    sm: 'w-4 h-4 text-sm', 
    md: 'w-5 h-5 text-base',
    lg: 'w-6 h-6 text-lg',
    xl: 'w-8 h-8 text-xl'
  }
  
  if (showEmoji && !showLucide) {
    return (
      <span className={`${sizeClasses[size]} ${className}`}>
        {icon.emoji}
      </span>
    )
  }
  
  if (showLucide && !showEmoji) {
    const LucideIcon = icon.LucideIcon
    return (
      <LucideIcon className={`${sizeClasses[size]} ${icon.color} ${className}`} />
    )
  }
  
  // Show both emoji and Lucide icon
  const LucideIcon = icon.LucideIcon
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <span className={sizeClasses[size]}>{icon.emoji}</span>
      <LucideIcon className={`${sizeClasses[size]} ${icon.color}`} />
    </div>
  )
}

export default {
  RELATIONSHIP_ICON_SETS,
  getRelationshipIconSet,
  getRelationshipIcon,
  getCheckinIcon,
  getConnectionIcon,
  getInsightsIcon,
  getGrowthIcon,
  getCelebrationIcon,
  getContextualIcon,
  getRelationshipColors,
  RelationshipIconComponent
}