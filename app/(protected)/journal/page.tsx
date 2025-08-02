// app/(protected)/journal/page.tsx
// Updated with brand colors and typography

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

  const saveNewEntry = async () => {
    if (!user || !newEntry.title.trim() || !newEntry.content.trim()) return

    setSaving(true)
    setMessage('')

    try {
      const tags = newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: user.id,
          title: newEntry.title.trim(),
          content: newEntry.content.trim(),
          mood_score: newEntry.mood_score,
          is_private: newEntry.is_private,
          tags: tags.length > 0 ? tags : null
        }])
        .select()

      if (error) throw error

      setMessage('✅ Journal entry saved successfully!')
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
      
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Error saving journal entry:', error)
      setMessage(`❌ Error saving entry: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const updateEntry = async () => {
    if (!editingEntry || !editEntry.title?.trim() || !editEntry.content?.trim()) return

    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: editEntry.title.trim(),
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
            <h1 className="text-heading-xl font-bold text-brand-charcoal mb-2 font-heading">Personal Journal</h1>
            <p className="text-brand-slate font-inter">Your private space for thoughts and reflections</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowNewEntryForm(true)}
              className="bg-brand-teal hover:bg-brand-dark-teal text-white"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Entry
            </Button>
            <Link href="/insights">
              <Button variant="outline" className="border-brand-coral-pink/30 text-brand-coral-pink hover:bg-brand-coral-pink/10">
                <Heart className="w-5 h-5 mr-2" />
                View AI Insights
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('❌') || message.includes('Error')
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
          <Card className="mb-8 border-brand-light-gray bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-brand-charcoal">Write New Entry</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewEntryForm(false)}
                  className="text-brand-slate hover:text-brand-charcoal"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                  Entry Title
                </label>
                <Input
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="What's on your mind today?"
                  className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                  Your Thoughts
                </label>
                <Textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Express your thoughts, feelings, and experiences..."
                  rows={6}
                  className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                    Mood Score (1-10)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newEntry.mood_score}
                      onChange={(e) => setNewEntry({ ...newEntry, mood_score: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-brand-light-gray rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #FF8A9B 0%, #FFCB8A 50%, #4AB9B8 100%)`
                      }}
                    />
                    <div className="flex items-center space-x-2">
                      {getMoodIcon(newEntry.mood_score)}
                      <span className="text-sm font-medium text-brand-charcoal font-inter">
                        {newEntry.mood_score}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                    Tags (optional)
                  </label>
                  <Input
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                    placeholder="love, growth, challenges..."
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
                  Keep this entry private (recommended)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={saveNewEntry}
                  disabled={saving || !newEntry.title.trim() || !newEntry.content.trim()}
                  className="bg-brand-teal hover:bg-brand-dark-teal text-white"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Save Entry
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
                  Write Your First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="border-brand-light-gray bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingEntry === entry.id ? (
                        <Input
                          value={editEntry.title || ''}
                          onChange={(e) => setEditEntry({ ...editEntry, title: e.target.value })}
                          className="text-lg font-semibold border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20 font-heading"
                        />
                      ) : (
                        <CardTitle className="text-lg font-semibold text-brand-charcoal font-heading">
                          {entry.title}
                        </CardTitle>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-brand-slate" />
                          <span className="text-sm text-brand-slate font-inter">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getMoodIcon(entry.mood_score)}
                          <span className="text-sm text-brand-slate font-inter">
                            Mood: {entry.mood_score || 'Not rated'}
                          </span>
                        </div>
                        {entry.is_private && (
                          <span className="text-xs bg-brand-teal/10 text-brand-teal px-2 py-1 rounded-full font-inter">
                            Private
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
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
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-brand-charcoal font-inter">Mood:</label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={editEntry.mood_score || 5}
                            onChange={(e) => setEditEntry({ ...editEntry, mood_score: parseInt(e.target.value) })}
                            className="w-24 h-2 bg-brand-light-gray rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm font-medium text-brand-charcoal font-inter">
                            {editEntry.mood_score || 5}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editEntry.is_private}
                            onChange={(e) => setEditEntry({ ...editEntry, is_private: e.target.checked })}
                            className="w-4 h-4 text-brand-teal bg-brand-cool-gray border-brand-light-gray rounded focus:ring-brand-teal/20"
                          />
                          <label className="text-sm text-brand-charcoal font-inter">Private</label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="prose prose-sm max-w-none text-brand-charcoal font-inter leading-relaxed">
                        {entry.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3 last:mb-0">
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
                            This entry may have generated personalized insights in your dashboard.
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