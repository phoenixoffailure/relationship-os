// components/ui/RelationshipContextSwitcher.tsx
// Phase 7.3: Relationship context switcher component
// Allows users to switch between relationship contexts and see adaptive UI

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRelationshipContext } from '@/lib/contexts/RelationshipContext'
import { getRelationshipIconSet, RelationshipIconComponent } from '@/lib/ui/relationship-aware-icons'
import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { ChevronDown, Shuffle } from 'lucide-react'

interface RelationshipContextSwitcherProps {
  className?: string
  showAllTypes?: boolean
  compact?: boolean
  showDescription?: boolean
}

export function RelationshipContextSwitcher({
  className = '',
  showAllTypes = false,
  compact = false,
  showDescription = true
}: RelationshipContextSwitcherProps) {
  const {
    activeRelationshipId,
    activeRelationship,
    relationships,
    relationshipTypes,
    hasMultipleTypes,
    dominantType,
    setActiveRelationshipId,
    loading
  } = useRelationshipContext()

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (!hasMultipleTypes && relationships.length <= 1) {
    // Don't show switcher if user has only one relationship type
    return null
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Select
          value={activeRelationshipId || ''}
          onValueChange={setActiveRelationshipId}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select relationship..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Relationships</SelectItem>
            {relationships.map((relationship) => (
              <SelectItem key={relationship.id} value={relationship.id}>
                <div className="flex items-center space-x-2">
                  <RelationshipIconComponent 
                    relationshipType={relationship.relationship_type}
                    iconType="primary"
                    size="sm"
                    showEmoji={true}
                    showLucide={false}
                  />
                  <span>{relationship.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {relationship.relationship_type}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasMultipleTypes && (
          <Badge variant="outline" className="text-xs">
            {relationshipTypes.length} types
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className={`border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Shuffle className="w-5 h-5 text-brand-teal" />
            <span>Relationship Context</span>
          </CardTitle>
          {hasMultipleTypes && (
            <Badge variant="outline" className="text-xs">
              {relationshipTypes.length} types
            </Badge>
          )}
        </div>
        {showDescription && (
          <p className="text-sm text-muted-foreground">
            Switch between your relationships to see context-aware insights and UI
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Relationship Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Active Relationship:</label>
            <Select
              value={activeRelationshipId || ''}
              onValueChange={setActiveRelationshipId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select relationship..." />
                <ChevronDown className="w-4 h-4 ml-2" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">All Relationships</span>
                  </div>
                </SelectItem>
                {relationships.map((relationship) => (
                  <SelectItem key={relationship.id} value={relationship.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <RelationshipIconComponent 
                          relationshipType={relationship.relationship_type}
                          iconType="primary"
                          size="sm"
                          showEmoji={true}
                          showLucide={false}
                        />
                        <span className="font-medium">{relationship.name}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="ml-2 text-xs capitalize"
                      >
                        {relationship.relationship_type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Context Display */}
          {activeRelationship && (
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <RelationshipIconComponent 
                    relationshipType={activeRelationship.relationship_type}
                    iconType="primary"
                    size="md"
                    showEmoji={true}
                    showLucide={false}
                  />
                  <div>
                    <div className="font-semibold text-sm">{activeRelationship.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {activeRelationship.relationship_type} relationship
                    </div>
                  </div>
                </div>
                <Badge className="bg-brand-teal text-white">
                  Active
                </Badge>
              </div>
            </div>
          )}

          {/* Show all types overview if requested */}
          {showAllTypes && (
            <div>
              <label className="text-sm font-medium mb-2 block">Your Relationship Types:</label>
              <div className="flex flex-wrap gap-2">
                {relationshipTypes.map((type) => {
                  const iconSet = getRelationshipIconSet(type)
                  const count = relationships.filter(r => r.relationship_type === type).length
                  const isDominant = type === dominantType
                  
                  return (
                    <Badge
                      key={type}
                      variant={isDominant ? "default" : "outline"}
                      className="flex items-center space-x-1 text-xs"
                    >
                      <span>{iconSet.primary.emoji}</span>
                      <span className="capitalize">{type}</span>
                      <span className="text-xs">({count})</span>
                      {isDominant && <span className="ml-1 text-xs">👑</span>}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex space-x-2 pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveRelationshipId(null)}
              className="text-xs"
            >
              Clear Selection
            </Button>
            {dominantType && !activeRelationshipId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const dominantRelationship = relationships.find(r => r.relationship_type === dominantType)
                  if (dominantRelationship) {
                    setActiveRelationshipId(dominantRelationship.id)
                  }
                }}
                className="text-xs"
              >
                <RelationshipIconComponent 
                  relationshipType={dominantType}
                  iconType="primary"
                  size="xs"
                  showEmoji={true}
                  showLucide={false}
                  className="mr-1"
                />
                Primary
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact inline switcher for navigation bars
export function InlineRelationshipSwitcher({ className = '' }: { className?: string }) {
  return (
    <RelationshipContextSwitcher 
      className={className}
      compact={true}
      showDescription={false}
    />
  )
}

// Sidebar widget for dashboard
export function RelationshipContextWidget({ className = '' }: { className?: string }) {
  return (
    <RelationshipContextSwitcher 
      className={className}
      showAllTypes={true}
      showDescription={true}
    />
  )
}