// components/journal/CleanJournalLayout.tsx
// Clean, decluttered journal page with focus on most recent entries per relationship

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createBrowserClient } from '@supabase/ssr'
import { 
  PlusCircle, 
  Calendar, 
  Save,
  BookOpen,
  Smile,
  Meh,
  Frown,
  ChevronDown,
  ChevronUp,
  Heart,
  Home,
  Users,
  Briefcase
} from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood_score: number | null
  created_at: string
  relationship_id?: string
  relationship_context?: string
}

interface Relationship {
  id: string
  name: string
  relationship_type: string
  role: string
}

export default function CleanJournalLayout() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  // Tab management
  const [activeTab, setActiveTab] = useState<string>('personal')
  const [showMoreEntries, setShowMoreEntries] = useState(false)
  
  // New entry form
  const [showNewEntryForm, setShowNewEntryForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood_score: 5,
    relationship_id: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await Promise.all([
          loadEntries(user.id),
          loadUserRelationships(user.id)
        ])
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadUserRelationships = async (userId: string) => {
    try {
      const { data: membershipData, error } = await supabase
        .from('relationship_members')
        .select(`
          relationship_id,
          role,
          relationships (
            id,
            name,
            relationship_type
          )
        `)
        .eq('user_id', userId)

      if (error) {
        console.error('Error loading relationships:', error)
        return
      }

      const relationshipsList = (membershipData || []).map((member: any) => ({
        id: member.relationship_id,
        name: member.relationships.name,
        relationship_type: member.relationships.relationship_type,
        role: member.role
      }))

      setRelationships(relationshipsList)
      
      // Auto-select first relationship if only one exists
      if (relationshipsList.length === 1) {
        setActiveTab(relationshipsList[0].id)
        setNewEntry(prev => ({ ...prev, relationship_id: relationshipsList[0].id }))
      }
    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  const loadEntries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50) // Load recent entries for performance

      if (error) throw error

      setEntries(data || [])
    } catch (error) {
      console.error('Error loading journal entries:', error)
      setMessage('Error loading journal entries')
    }
  }

  const saveNewEntry = async () => {
    if (!user || !newEntry.content.trim()) return

    setSaving(true)
    setMessage('')

    try {
      console.log('📝 Saving journal entry...')
      
      const entryData = {
        user_id: user.id,
        title: newEntry.title.trim() || 'Untitled Entry',
        content: newEntry.content.trim(),
        mood_score: newEntry.mood_score,
        is_private: true,
        relationship_id: newEntry.relationship_id || null,
        relationship_context: newEntry.relationship_id 
          ? relationships.find(r => r.id === newEntry.relationship_id)?.name || null
          : null
      }

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([entryData])
        .select()
        .single()

      if (error) throw error

      // Call enhanced analysis with relationship context
      const analysisResponse = await fetch('/api/journal/unified-save-and-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newEntry.content,
          journal_id: data.id,
          relationship_id: newEntry.relationship_id || null
        })
      })

      if (!analysisResponse.ok) {
        console.warn('Enhanced analysis failed, but journal entry was saved')
      } else {
        const analysisData = await analysisResponse.json()
        console.log('✅ Enhanced analysis completed:', analysisData.analysis_id)
      }

      // Reset form and reload entries
      setNewEntry({ 
        title: '', 
        content: '', 
        mood_score: 5, 
        relationship_id: activeTab !== 'personal' ? activeTab : ''
      })
      setShowNewEntryForm(false)
      await loadEntries(user.id)
      setMessage('Journal entry saved and insights generated! 🎉')
      
      // Auto-switch to the tab of the relationship we just wrote about
      if (newEntry.relationship_id) {
        setActiveTab(newEntry.relationship_id)
      }
      
      setTimeout(() => setMessage(''), 5000)

    } catch (error: any) {
      console.error('Error saving journal entry:', error)
      setMessage(`❌ Error saving entry: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const getMoodIcon = (mood: number | null) => {
    if (!mood) return <Meh className="w-5 h-5 text-gray-400" />
    if (mood <= 3) return <Frown className="w-5 h-5 text-red-500" />
    if (mood <= 7) return <Meh className="w-5 h-5 text-yellow-500" />
    return <Smile className="w-5 h-5 text-green-500" />
  }

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'romantic':
        return <Heart className="w-4 h-4 text-pink-500" />
      case 'family':
        return <Home className="w-4 h-4 text-blue-500" />
      case 'friend':
        return <Users className="w-4 h-4 text-green-500" />
      case 'work':
        return <Briefcase className="w-4 h-4 text-gray-500" />
      default:
        return <Users className="w-4 h-4 text-purple-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Filter entries based on active tab
  const getFilteredEntries = () => {
    if (activeTab === 'personal') {
      // For "Personal" tab, show only entries NOT tied to any relationship
      const personalEntries = entries.filter(entry => !entry.relationship_id)
      return showMoreEntries ? personalEntries : personalEntries.slice(0, 1)
    } else {
      // For specific relationship tabs, show entries for that relationship
      const relationshipEntries = entries.filter(entry => entry.relationship_id === activeTab)
      return showMoreEntries ? relationshipEntries : relationshipEntries.slice(0, 1)
    }
  }

  const filteredEntries = getFilteredEntries()
  const hasMoreEntries = activeTab === 'personal' 
    ? entries.filter(e => !e.relationship_id).length > 1
    : entries.filter(e => e.relationship_id === activeTab).length > 1

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-slate">Loading your journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clean Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-charcoal">Your Journal</h1>
            <p className="text-brand-slate mt-2">Private reflections that generate AI insights</p>
          </div>
          <Button
            onClick={() => setShowNewEntryForm(true)}
            className="bg-brand-teal hover:bg-brand-teal-dark text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('❌') 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* New Entry Form */}
        {showNewEntryForm && (
          <Card className="mb-8 border-brand-light-gray">
            <CardHeader>
              <CardTitle>Write New Entry</CardTitle>
              <CardDescription>
                Share your thoughts and feelings. This will generate personalized insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Relationship Selector */}
              {relationships.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">
                    About which relationship?
                  </label>
                  <select
                    value={newEntry.relationship_id}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, relationship_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                  >
                    <option value="">Personal reflection</option>
                    {relationships.map(relationship => (
                      <option key={relationship.id} value={relationship.id}>
                        {relationship.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2">
                  Title (optional)
                </label>
                <Input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="Give your entry a title..."
                  className="border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2">
                  Your thoughts *
                </label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="What's on your mind today?"
                  rows={6}
                  className="border-gray-200 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-3">
                  Mood: <span className="font-bold text-brand-teal">{newEntry.mood_score}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.mood_score}
                  onChange={(e) => setNewEntry({ ...newEntry, mood_score: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>Neutral</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={saveNewEntry}
                  disabled={saving || !newEntry.content.trim()}
                  className="bg-brand-teal hover:bg-brand-teal-dark text-white"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Entry
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewEntryForm(false)
                    setNewEntry({ title: '', content: '', mood_score: 5, relationship_id: '' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-brand-teal text-brand-teal'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Personal
          </button>
          {relationships.length > 0 && relationships.map(relationship => (
              <button
                key={relationship.id}
                onClick={() => setActiveTab(relationship.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === relationship.id
                    ? 'border-brand-teal text-brand-teal'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {getRelationshipIcon(relationship.relationship_type)}
                <span>{relationship.name}</span>
              </button>
            ))}
        </div>

        {/* Journal Entries Display */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
                  {activeTab === 'personal' ? 'Start Your Journey' : 'No entries yet'}
                </h3>
                <p className="text-brand-slate mb-4">
                  {activeTab === 'personal' 
                    ? 'Begin documenting your personal thoughts and reflections.'
                    : `Write about your experiences with ${relationships.find(r => r.id === activeTab)?.name}.`
                  }
                </p>
                <Button
                  onClick={() => {
                    setShowNewEntryForm(true)
                    if (activeTab !== 'personal') {
                      setNewEntry(prev => ({ ...prev, relationship_id: activeTab }))
                    }
                  }}
                  className="bg-brand-teal hover:bg-brand-teal-dark text-white"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Write First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-brand-charcoal">
                          {entry.title || 'Untitled Entry'}
                        </h3>
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(entry.created_at)}</span>
                          </div>
                          {entry.mood_score && (
                            <div className="flex items-center space-x-1">
                              {getMoodIcon(entry.mood_score)}
                              <span className="text-sm text-gray-500">{entry.mood_score}/10</span>
                            </div>
                          )}
                          {entry.relationship_context && (
                            <span className="text-xs bg-brand-teal/10 text-brand-teal px-2 py-1 rounded-full">
                              {entry.relationship_context}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-brand-charcoal">
                      {entry.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-3">
                          {paragraph || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Show More / Show Less Toggle */}
              {hasMoreEntries && (
                <div className="text-center">
                  <Button 
                    onClick={() => setShowMoreEntries(!showMoreEntries)}
                    variant="outline"
                    className="text-brand-teal border-brand-teal hover:bg-brand-teal hover:text-white"
                  >
                    {showMoreEntries ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        View Older Entries
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}