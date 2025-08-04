// app/(protected)/journal/page.tsx
// FIXED: Now uses save-and-analyze endpoint for partner suggestions

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createBrowserClient } from '@supabase/ssr'
import { 
  PlusCircle, 
  Calendar, 
  Heart, 
  Trash2, 
  Edit3,
  Save,
  X,
  BookOpen,
  Smile,
  Meh,
  Frown
} from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood_score: number | null
  created_at: string
  updated_at: string
  tags?: string[]
  is_private: boolean
  ai_analysis?: any
}

export default function JournalPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  // New entry form
  const [showNewEntryForm, setShowNewEntryForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood_score: 5,
    is_private: true,
    tags: ''
  })
  
  // Edit entry
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [editEntry, setEditEntry] = useState<Partial<JournalEntry>>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadEntries(user.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadEntries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setEntries(data || [])
    } catch (error) {
      console.error('Error loading journal entries:', error)
      setMessage('Error loading journal entries')
    }
  }

  // FIXED: Now uses the save-and-analyze endpoint that triggers partner suggestions
  const saveNewEntry = async () => {
    if (!user || !newEntry.content.trim()) return

    setSaving(true)
    setMessage('')

    try {
      console.log('📝 Saving journal entry via save-and-analyze endpoint...')
      
      // Use the save-and-analyze endpoint that triggers partner suggestions
      const response = await fetch('/api/journal/save-and-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newEntry.content.trim(),
          mood_score: newEntry.mood_score,
          user_id: user.id,
          title: newEntry.title.trim() || 'Untitled Entry',
          is_private: newEntry.is_private,
          tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage('✅ Journal entry saved! AI analysis and partner suggestions are being generated...')
        setNewEntry({
          title: '',
          content: '',
          mood_score: 5,
          is_private: true,
          tags: ''
        })
        setShowNewEntryForm(false)
        
        // Reload entries
        await loadEntries(user.id)
        
        // Show success message with partner suggestions info
        if (result.partnerSuggestionsTriggered > 0) {
          setTimeout(() => {
            setMessage(`✅ Entry saved! Generated suggestions for ${result.partnerSuggestionsTriggered} relationship(s). Check your partner's dashboard!`)
          }, 1000)
        }
        
        setTimeout(() => setMessage(''), 5000)
      } else {
        console.error('Save-and-analyze error:', result)
        setMessage(`❌ Error saving entry: ${result.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      console.error('Error saving journal entry:', error)
      setMessage(`❌ Error saving entry: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const updateEntry = async () => {
    if (!editingEntry || !editEntry.content?.trim()) return

    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: editEntry.title?.trim() || 'Untitled Entry',
          content: editEntry.content.trim(),
          mood_score: editEntry.mood_score,
          is_private: editEntry.is_private,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingEntry)

      if (error) throw error

      setMessage('✅ Journal entry updated successfully!')
      setEditingEntry(null)
      setEditEntry({})
      
      // Reload entries
      await loadEntries(user.id)
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Error updating journal entry:', error)
      setMessage(`❌ Error updating entry: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error

      setMessage('✅ Journal entry deleted successfully!')
      await loadEntries(user.id)
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Error deleting journal entry:', error)
      setMessage(`❌ Error deleting entry: ${error.message}`)
    }
  }

  const startEditing = (entry: JournalEntry) => {
    setEditingEntry(entry.id)
    setEditEntry({
      title: entry.title,
      content: entry.content,
      mood_score: entry.mood_score,
      is_private: entry.is_private
    })
  }

  const cancelEditing = () => {
    setEditingEntry(null)
    setEditEntry({})
  }

  const getMoodIcon = (mood: number | null) => {
    if (!mood) return <Meh className="w-5 h-5 text-brand-slate" />
    if (mood <= 3) return <Frown className="w-5 h-5 text-red-500" />
    if (mood <= 7) return <Meh className="w-5 h-5 text-brand-warm-peach" />
    return <Smile className="w-5 h-5 text-green-500" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-light-gray border-t-brand-teal rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-slate font-inter">Loading your journal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-teal to-brand-dark-teal rounded-2xl shadow-lg mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-brand-charcoal mb-2 font-heading">My Journal</h1>
            <p className="text-brand-slate font-inter">
              Your private space for reflection and growth. AI analyzes your entries to generate insights and partner suggestions.
            </p>
          </div>

          {!showNewEntryForm && (
            <div className="text-center">
              <Button
                onClick={() => setShowNewEntryForm(true)}
                className="bg-brand-teal hover:bg-brand-dark-teal text-white"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Write New Entry
              </Button>
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('❌') 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-brand-teal/10 border-brand-teal/30 text-brand-dark-teal'
          }`}>
            <div className="flex items-center">
              <span className="text-sm font-medium font-inter">{message}</span>
            </div>
          </div>
        )}

        {/* New Entry Form */}
        {showNewEntryForm && (
          <Card className="mb-8 border-brand-light-gray bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading text-brand-charcoal">Write New Entry</CardTitle>
              <CardDescription className="font-inter text-brand-slate">
                Share your thoughts, feelings, and experiences. This will generate personalized insights and suggestions for your partner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                  Title (optional)
                </label>
                <Input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="Give your entry a title..."
                  className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                  Your thoughts *
                </label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="What's on your mind today? Share your thoughts, feelings, experiences..."
                  rows={6}
                  className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20 resize-none"
                  required
                />
                {/* Soft guidance to reassure privacy */}
                <p className="text-xs italic text-brand-slate mt-2">
                  This is private. Write freely.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-3 font-inter">
                  Mood Score: <span className="font-bold text-brand-teal">{newEntry.mood_score}/10</span>
                </label>
                <div className="px-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newEntry.mood_score}
                    onChange={(e) => setNewEntry({ ...newEntry, mood_score: parseInt(e.target.value) })}
                    className="w-full h-2 bg-brand-cool-gray rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-brand-slate mt-1 font-inter">
                    <span>1 - Very Low</span>
                    <span>5 - Neutral</span>
                    <span>10 - Excellent</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                    Tags (optional)
                  </label>
                  <Input
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                    placeholder="grateful, work, family..."
                    className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20"
                  />
                  <p className="text-xs text-brand-slate mt-1 font-inter">Separate with commas</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={newEntry.is_private}
                  onChange={(e) => setNewEntry({ ...newEntry, is_private: e.target.checked })}
                  className="w-4 h-4 text-brand-teal bg-brand-cool-gray border-brand-light-gray rounded focus:ring-brand-teal/20"
                />
                <label htmlFor="is_private" className="text-sm text-brand-charcoal font-inter">
                  Keep this entry private (recommended - only generates anonymous partner suggestions)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={saveNewEntry}
                  disabled={saving || !newEntry.content.trim()}
                  className="bg-brand-teal hover:bg-brand-dark-teal text-white"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving & Generating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Save & Generate Suggestions
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewEntryForm(false)}
                  className="border-brand-light-gray"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Journal Entries */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <Card className="border-brand-light-gray bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold text-brand-charcoal mb-2 font-heading">Start Your Journey</h3>
                <p className="text-brand-slate mb-4 font-inter">
                  Begin documenting your thoughts and feelings. Your journal is completely private and secure.
                </p>
                <Button
                  onClick={() => setShowNewEntryForm(true)}
                  className="bg-brand-teal hover:bg-brand-dark-teal text-white"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Write First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="border-brand-light-gray bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="w-4 h-4 text-brand-slate" />
                        <span className="text-sm text-brand-slate font-inter">
                          {formatDate(entry.created_at)}
                        </span>
                        {entry.mood_score && (
                          <div className="flex items-center space-x-1">
                            {getMoodIcon(entry.mood_score)}
                            <span className="text-sm text-brand-slate font-inter">{entry.mood_score}/10</span>
                          </div>
                        )}
                        {entry.is_private && (
                          <span className="px-2 py-1 bg-brand-teal/10 text-brand-teal text-xs rounded-full font-inter">
                            Private
                          </span>
                        )}
                      </div>
                      {editingEntry === entry.id ? (
                        <Input
                          value={editEntry.title || ''}
                          onChange={(e) => setEditEntry({ ...editEntry, title: e.target.value })}
                          placeholder="Entry title..."
                          className="font-heading text-lg border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20"
                        />
                      ) : (
                        <CardTitle className="font-heading text-brand-charcoal">
                          {entry.title || 'Untitled Entry'}
                        </CardTitle>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingEntry === entry.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={updateEntry}
                            disabled={saving}
                            className="bg-brand-teal hover:bg-brand-dark-teal text-white"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            className="border-brand-light-gray"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(entry)}
                            className="border-brand-light-gray hover:bg-brand-cool-gray"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteEntry(entry.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingEntry === entry.id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={editEntry.content || ''}
                        onChange={(e) => setEditEntry({ ...editEntry, content: e.target.value })}
                        rows={6}
                        className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20 resize-none"
                      />
                      <div>
                        <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                          Mood Score: <span className="font-bold text-brand-teal">{editEntry.mood_score || 5}/10</span>
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={editEntry.mood_score || 5}
                          onChange={(e) => setEditEntry({ ...editEntry, mood_score: parseInt(e.target.value) })}
                          className="w-full h-2 bg-brand-cool-gray rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="prose prose-sm max-w-none text-brand-charcoal font-inter">
                        {entry.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3">
                            {paragraph || '\u00A0'}
                          </p>
                        ))}
                      </div>
                      
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {entry.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-brand-coral-pink/10 text-brand-coral-pink text-xs rounded-full font-inter"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {entry.ai_analysis && (
                        <div className="mt-4 p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-lg">
                          <h4 className="font-medium text-brand-dark-teal mb-2 font-inter">AI Insights</h4>
                          <p className="text-sm text-brand-slate font-inter">
                            This entry has generated personalized insights and partner suggestions. Check your insights dashboard and your partner's suggestions.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Bottom Actions */}
        {entries.length > 0 && !showNewEntryForm && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => setShowNewEntryForm(true)}
              className="bg-brand-teal hover:bg-brand-dark-teal text-white"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Write Another Entry
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}