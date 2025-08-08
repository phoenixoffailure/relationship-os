// lib/contexts/RelationshipContext.tsx
// Phase 7.3: Context provider for relationship-aware UI adaptation
// Tracks user's current relationship context for dynamic icon and color switching

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { createBrowserClient } from '@supabase/ssr'

interface Relationship {
  id: string
  name: string
  relationship_type: RelationshipType
  created_at: string
}

interface RelationshipContextValue {
  // Current relationship context
  activeRelationshipId: string | null
  activeRelationshipType: RelationshipType | null
  activeRelationship: Relationship | null
  
  // All user relationships
  relationships: Relationship[]
  relationshipTypes: RelationshipType[]
  
  // Context management
  setActiveRelationshipId: (id: string | null) => void
  setActiveRelationshipType: (type: RelationshipType | null) => void
  refreshRelationships: () => Promise<void>
  
  // Multi-relationship context
  hasMultipleTypes: boolean
  dominantType: RelationshipType | null // Most common relationship type for user
  
  // Loading states
  loading: boolean
  error: string | null
}

const RelationshipContext = createContext<RelationshipContextValue | undefined>(undefined)

interface RelationshipProviderProps {
  children: ReactNode
  userId?: string
}

export function RelationshipProvider({ children, userId }: RelationshipProviderProps) {
  // State management
  const [activeRelationshipId, setActiveRelationshipId] = useState<string | null>(null)
  const [activeRelationshipType, setActiveRelationshipType] = useState<RelationshipType | null>(null)
  const [activeRelationship, setActiveRelationship] = useState<Relationship | null>(null)
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Computed values
  const relationshipTypes: RelationshipType[] = Array.from(
    new Set(relationships.map(r => r.relationship_type))
  )
  
  const hasMultipleTypes = relationshipTypes.length > 1
  
  const dominantType: RelationshipType | null = relationshipTypes.length > 0 
    ? relationshipTypes.reduce((dominant, type) => {
        const currentCount = relationships.filter(r => r.relationship_type === type).length
        const dominantCount = relationships.filter(r => r.relationship_type === dominant).length
        return currentCount > dominantCount ? type : dominant
      })
    : null

  // Load relationships for user
  const refreshRelationships = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get user's relationship memberships
      const { data: memberData, error: memberError } = await supabase
        .from('relationship_members')
        .select(`
          relationship_id,
          relationships (
            id,
            name,
            relationship_type,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (memberError) throw memberError

      // Extract relationships from member data
      const userRelationships = (memberData || [])
        .map((member: any) => member.relationships)
        .filter(Boolean)
        .map((rel: any) => ({
          id: rel.id,
          name: rel.name,
          relationship_type: rel.relationship_type as RelationshipType,
          created_at: rel.created_at
        }))

      setRelationships(userRelationships)
      
      // Auto-select first relationship if none selected
      if (!activeRelationshipId && userRelationships.length > 0) {
        const firstRelationship = userRelationships[0]
        setActiveRelationshipId(firstRelationship.id)
        setActiveRelationshipType(firstRelationship.relationship_type)
        setActiveRelationship(firstRelationship)
      }

      console.log(`🔄 Phase 7.3: Loaded ${userRelationships.length} relationships for context switching`)
      console.log(`🎯 Relationship types: ${relationshipTypes.join(', ')}`)

    } catch (error) {
      console.error('❌ Error loading relationships for context:', error)
      setError(error instanceof Error ? error.message : 'Failed to load relationships')
    } finally {
      setLoading(false)
    }
  }

  // Update active relationship when ID changes
  useEffect(() => {
    if (activeRelationshipId) {
      const relationship = relationships.find(r => r.id === activeRelationshipId)
      setActiveRelationship(relationship || null)
      setActiveRelationshipType(relationship?.relationship_type || null)
    } else {
      setActiveRelationship(null)
      setActiveRelationshipType(null)
    }
  }, [activeRelationshipId, relationships])

  // Initial load
  useEffect(() => {
    if (userId) {
      refreshRelationships()
    }
  }, [userId])

  // Automatic context switching based on page context
  const handleActiveRelationshipIdChange = (id: string | null) => {
    setActiveRelationshipId(id)
    
    // Update relationship type based on selected relationship
    if (id) {
      const relationship = relationships.find(r => r.id === id)
      if (relationship) {
        setActiveRelationshipType(relationship.relationship_type)
        console.log(`🎯 Phase 7.3: Context switched to ${relationship.relationship_type} relationship: ${relationship.name}`)
      }
    } else {
      setActiveRelationshipType(null)
      console.log(`🎯 Phase 7.3: Context cleared - no active relationship`)
    }
  }

  const handleActiveRelationshipTypeChange = (type: RelationshipType | null) => {
    setActiveRelationshipType(type)
    
    // If setting type directly, try to find a matching relationship
    if (type && !activeRelationshipId) {
      const matchingRelationship = relationships.find(r => r.relationship_type === type)
      if (matchingRelationship) {
        setActiveRelationshipId(matchingRelationship.id)
        setActiveRelationship(matchingRelationship)
        console.log(`🎯 Phase 7.3: Auto-selected ${type} relationship: ${matchingRelationship.name}`)
      }
    }
  }

  const contextValue: RelationshipContextValue = {
    // Current context
    activeRelationshipId,
    activeRelationshipType,
    activeRelationship,
    
    // All relationships
    relationships,
    relationshipTypes,
    
    // Context management
    setActiveRelationshipId: handleActiveRelationshipIdChange,
    setActiveRelationshipType: handleActiveRelationshipTypeChange,
    refreshRelationships,
    
    // Multi-relationship context
    hasMultipleTypes,
    dominantType,
    
    // Loading states
    loading,
    error
  }

  return (
    <RelationshipContext.Provider value={contextValue}>
      {children}
    </RelationshipContext.Provider>
  )
}

// Hook to use relationship context
export function useRelationshipContext(): RelationshipContextValue {
  const context = useContext(RelationshipContext)
  if (context === undefined) {
    throw new Error('useRelationshipContext must be used within a RelationshipProvider')
  }
  return context
}

// Hook to get current relationship type with fallback logic
export function useCurrentRelationshipType(): RelationshipType {
  const { activeRelationshipType, dominantType, relationshipTypes } = useRelationshipContext()
  
  // Return active type if set
  if (activeRelationshipType) return activeRelationshipType
  
  // Return dominant type if available
  if (dominantType) return dominantType
  
  // Return first available type
  if (relationshipTypes.length > 0) return relationshipTypes[0]
  
  // Default to 'other'
  return 'other'
}

// Hook to get relationship-aware colors and styles
export function useRelationshipTheming() {
  const relationshipType = useCurrentRelationshipType()
  const { hasMultipleTypes } = useRelationshipContext()
  
  // Return theme values based on current relationship context
  const getThemeColors = () => {
    switch (relationshipType) {
      case 'romantic':
        return {
          primary: 'text-pink-500',
          bg: 'bg-pink-50',
          border: 'border-pink-200',
          hover: 'hover:bg-pink-100'
        }
      case 'work':
        return {
          primary: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          hover: 'hover:bg-blue-100'
        }
      case 'family':
        return {
          primary: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          hover: 'hover:bg-green-100'
        }
      case 'friend':
        return {
          primary: 'text-orange-500',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          hover: 'hover:bg-orange-100'
        }
      case 'other':
        return {
          primary: 'text-purple-500',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          hover: 'hover:bg-purple-100'
        }
      default:
        return {
          primary: 'text-brand-teal',
          bg: 'bg-brand-cool-gray',
          border: 'border-brand-light-gray',
          hover: 'hover:bg-brand-light-gray'
        }
    }
  }

  return {
    relationshipType,
    hasMultipleTypes,
    colors: getThemeColors()
  }
}

export default RelationshipContext