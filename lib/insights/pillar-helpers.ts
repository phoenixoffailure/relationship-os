// lib/insights/pillar-helpers.ts
// Updated pillar configuration with new brand colors

export const PILLAR_CONFIG = {
  pattern: {
    name: 'Pattern Analysis',
    color: 'pillar-pattern',
    icon: '📊',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    badgeColor: 'bg-teal-100 text-teal-700',
    hoverColor: 'hover:bg-teal-100'
  },
  suggestion: {
    name: 'Action Steps', 
    color: 'pillar-action',
    icon: '💡',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    badgeColor: 'bg-rose-100 text-rose-700',
    hoverColor: 'hover:bg-rose-100'
  },
  appreciation: {
    name: 'Strengths & Gratitude',
    color: 'pillar-gratitude',
    icon: '❤️',
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-700',
    hoverColor: 'hover:bg-orange-100'
  },
  milestone: {
    name: 'Progress & Achievements',
    color: 'pillar-milestone',
    icon: '🏆',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200', 
    textColor: 'text-cyan-700',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    hoverColor: 'hover:bg-cyan-100'
  }
}

// Alternative configuration using brand colors directly
export const BRAND_PILLAR_CONFIG = {
  pattern: {
    name: 'Pattern Analysis',
    color: 'brand-teal',
    icon: '📊',
    bgColor: 'bg-brand-teal/5',
    borderColor: 'border-brand-teal/20',
    textColor: 'text-brand-dark-teal',
    badgeColor: 'bg-brand-teal/10 text-brand-dark-teal',
    hoverColor: 'hover:bg-brand-teal/10'
  },
  suggestion: {
    name: 'Action Steps', 
    color: 'brand-coral',
    icon: '💡',
    bgColor: 'bg-brand-coral-pink/5',
    borderColor: 'border-brand-coral-pink/20',
    textColor: 'text-brand-coral-pink',
    badgeColor: 'bg-brand-coral-pink/10 text-brand-coral-pink',
    hoverColor: 'hover:bg-brand-coral-pink/10'
  },
  appreciation: {
    name: 'Strengths & Gratitude',
    color: 'brand-peach',
    icon: '❤️',
    bgColor: 'bg-brand-warm-peach/5', 
    borderColor: 'border-brand-warm-peach/20',
    textColor: 'text-orange-600',
    badgeColor: 'bg-brand-warm-peach/10 text-orange-600',
    hoverColor: 'hover:bg-brand-warm-peach/10'
  },
  milestone: {
    name: 'Progress & Achievements',
    color: 'brand-deep-teal',
    icon: '🏆',
    bgColor: 'bg-brand-deep-teal/5',
    borderColor: 'border-brand-deep-teal/20', 
    textColor: 'text-brand-deep-teal',
    badgeColor: 'bg-brand-deep-teal/10 text-brand-deep-teal',
    hoverColor: 'hover:bg-brand-deep-teal/10'
  }
}

export function getPillarConfig(type: string, useBrandColors: boolean = false) {
  const config = useBrandColors ? BRAND_PILLAR_CONFIG : PILLAR_CONFIG;
  return config[type as keyof typeof config] || config.suggestion
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

// New utility functions for brand consistency
export function getBrandColor(element: 'primary' | 'secondary' | 'accent' | 'highlight') {
  const brandColors = {
    primary: 'brand-teal',
    secondary: 'brand-soft-teal', 
    accent: 'brand-coral-pink',
    highlight: 'brand-warm-peach'
  }
  return brandColors[element]
}

export function getPillarBrandTheme(pillarType: string | null | undefined) {
  switch (pillarType) {
    case 'pattern':
      return {
        bg: 'bg-brand-teal/5',
        border: 'border-brand-teal/20',
        text: 'text-brand-dark-teal',
        badge: 'bg-brand-teal/10 text-brand-dark-teal',
        hover: 'hover:bg-brand-teal/10',
        icon: '📊'
      }
    case 'action':
      return {
        bg: 'bg-brand-coral-pink/5',
        border: 'border-brand-coral-pink/20',
        text: 'text-brand-coral-pink',
        badge: 'bg-brand-coral-pink/10 text-brand-coral-pink',
        hover: 'hover:bg-brand-coral-pink/10',
        icon: '💡'
      }
    case 'gratitude':
      return {
        bg: 'bg-brand-warm-peach/5',
        border: 'border-brand-warm-peach/20',
        text: 'text-orange-600',
        badge: 'bg-brand-warm-peach/10 text-orange-600',
        hover: 'hover:bg-brand-warm-peach/10',
        icon: '❤️'
      }
    case 'milestone':
      return {
        bg: 'bg-brand-deep-teal/5',
        border: 'border-brand-deep-teal/20',
        text: 'text-brand-deep-teal',
        badge: 'bg-brand-deep-teal/10 text-brand-deep-teal',
        hover: 'hover:bg-brand-deep-teal/10',
        icon: '🏆'
      }
    default:
      return {
        bg: 'bg-brand-highlight/5',
        border: 'border-brand-highlight/20',
        text: 'text-brand-charcoal',
        badge: 'bg-brand-highlight/10 text-brand-charcoal',
        hover: 'hover:bg-brand-highlight/10',
        icon: '💝'
      }
  }
}