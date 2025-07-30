// lib/insights/pillar-helpers.ts
// Minimal pillar configuration for personal insights only

export const PILLAR_CONFIG = {
  pattern: {
    name: 'Pattern Analysis',
    color: 'blue',
    icon: '📊',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  suggestion: {
    name: 'Action Steps', 
    color: 'emerald',
    icon: '💡',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700'
  },
  appreciation: {
    name: 'Strengths & Gratitude',
    color: 'pink',
    icon: '❤️',
    bgColor: 'bg-pink-50', 
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700'
  },
  milestone: {
    name: 'Progress & Achievements',
    color: 'purple',
    icon: '🏆',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200', 
    textColor: 'text-purple-700'
  }
}

export function getPillarConfig(type: string) {
  return PILLAR_CONFIG[type as keyof typeof PILLAR_CONFIG] || PILLAR_CONFIG.suggestion
}

export function formatPillarTitle(type: string, originalTitle: string): string {
  const config = getPillarConfig(type)
  
  // If title already has pillar info, return as-is
  if (originalTitle.includes('Pattern:') || originalTitle.includes('Action:') || 
      originalTitle.includes('Appreciation:') || originalTitle.includes('Milestone:')) {
    return originalTitle
  }
  
  // Add subtle pillar prefix
  const prefixes = {
    pattern: 'Pattern:',
    suggestion: 'Action:',
    appreciation: 'Appreciation:',
    milestone: 'Milestone:'
  }
  
  const prefix = prefixes[type as keyof typeof prefixes] || ''
  return prefix ? `${prefix} ${originalTitle}` : originalTitle
}