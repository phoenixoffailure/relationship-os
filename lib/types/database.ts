// This file re-exports the generated types and can add custom types
// The generated types are in database.generated.ts

export * from './database.generated'

// Add any custom types or overrides here
// For example, types that need special handling or aren't in the database

export interface UserWithProfile {
  id: string
  email: string
  full_name: string | null
  universal_profile?: UniversalUserProfile
  relationships?: Relationship[]
}

export interface RelationshipWithMembers {
  id: string
  name: string
  relationship_type: 'romantic' | 'family' | 'friend' | 'work' | 'other'
  created_by: string
  created_at: string | null
  members?: RelationshipMember[]
}

export interface JournalEntryWithAnalysis {
  id: string
  content: string
  mood_score: number | null
  created_at: string | null
  analysis?: EnhancedJournalAnalysis
  relationship?: Relationship
}

// Import generated types for use in custom interfaces
import type { 
  UniversalUserProfile,
  Relationship,
  RelationshipMember,
  EnhancedJournalAnalysis 
} from './database.generated'

// Type guards for runtime checking
export function isUniversalUserProfile(obj: any): obj is UniversalUserProfile {
  return obj && typeof obj.user_id === 'string'
}

export function isRelationship(obj: any): obj is Relationship {
  return obj && typeof obj.name === 'string' && typeof obj.relationship_type === 'string'
}