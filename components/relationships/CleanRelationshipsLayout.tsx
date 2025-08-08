// components/relationships/CleanRelationshipsLayout.tsx
// Clean, decluttered relationships page focusing on active relationships

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { 
  PlusCircle, 
  Heart, 
  Home, 
  Users, 
  Briefcase,
  Settings,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react'

interface CleanRelationshipsLayoutProps {
  user: any
}

export default function CleanRelationshipsLayout({ user }: CleanRelationshipsLayoutProps) {
  const [relationships, setRelationships] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showMoreHistory, setShowMoreHistory] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [message, setMessage] = useState('')

  const router = useRouter()

  // Invite form state - keeping existing functionality
  const [inviteData, setInviteData] = useState({
    partnerName: '',
    relationshipName: '',
    relationshipType: 'romantic'
  })

  // Code system state
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      loadAllData()
    }
  }, [user])

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([
      loadRelationships(),
      loadInvitations()
    ])
    setLoading(false)
  }

  const loadRelationships = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('relationship_members')
        .select(`
          relationship_id,
          role,
          joined_at,
          relationships (
            id,
            name,
            relationship_type,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id)

      if (memberError) throw memberError

      const relationshipsWithMembers = await Promise.all(
        (memberData || []).map(async (member) => {
          const { data: otherMembers, error: membersError } = await supabase
            .from('relationship_members')
            .select(`
              user_id,
              role,
              joined_at,
              users (
                id,
                email,
                full_name
              )
            `)
            .eq('relationship_id', member.relationship_id)
            .neq('user_id', user.id)

          if (membersError) {
            console.error('Error loading members:', membersError)
            return {
              ...member.relationships,
              myRole: member.role,
              joinedAt: member.joined_at,
              otherMembers: []
            }
          }

          return {
            ...member.relationships,
            myRole: member.role,
            joinedAt: member.joined_at,
            otherMembers: otherMembers || []
          }
        })
      )

      setRelationships(relationshipsWithMembers)
    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  const loadInvitations = async () => {
    try {
      const { data: sentInvites, error: sentError } = await supabase
        .from('relationship_invitations')
        .select('*')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false })

      if (sentError) {
        console.error('Error loading sent invitations:', sentError)
      }

      setInvitations((sentInvites || []).map(inv => ({ ...inv, type: 'sent' })))
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }

  // Keep existing invitation generation logic
  const generateInviteCode = async () => {
    if (!user || !inviteData.relationshipName) return

    setInviteLoading(true)
    setMessage('')

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      const { data, error } = await supabase
        .from('relationship_invitations')
        .insert([{
          from_user_id: user.id,
          invite_code: code,
          to_email: null,
          relationship_name: inviteData.relationshipName,
          relationship_type: inviteData.relationshipType,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      setGeneratedCode(code)
      setShowCodeModal(true)
      setShowInviteForm(false)
      setInviteData({ partnerName: '', relationshipName: '', relationshipType: 'romantic' })
      
      await loadInvitations()
        
    } catch (error: any) {
      console.error('Error generating invite code:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setInviteLoading(false)
    }
  }

  // Keep existing join logic
  const acceptInvitation = async () => {
    if (!user || !inviteCode.trim()) return

    setJoinLoading(true)
    setMessage('')

    try {
      const { data: invitations, error: findError } = await supabase
        .from('relationship_invitations')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .eq('status', 'pending')

      if (findError || !invitations || invitations.length === 0) {
        setMessage('Invalid or expired invitation code.')
        return
      }

      const invitation = invitations[0]

      if (new Date(invitation.expires_at) < new Date()) {
        setMessage('This invitation code has expired.')
        return
      }

      if (invitation.from_user_id === user.id) {
        setMessage('You cannot accept your own invitation!')
        return
      }

      // Check for existing relationships
      const { data: existingMembers } = await supabase
        .from('relationship_members')
        .select(`
          relationship_id,
          relationships (
            id,
            name,
            created_by
          )
        `)
        .eq('user_id', user.id)

      if (existingMembers) {
        const hasExistingRelationship = existingMembers.some((member: any) => {
          const relationship = member.relationships
          return relationship && relationship.created_by === invitation.from_user_id
        })

        if (hasExistingRelationship) {
          setMessage('You are already connected with this person!')
          return
        }
      }

      // Create relationship
      const { data: relationshipData, error: relationshipError } = await supabase
        .from('relationships')
        .insert([{
          name: invitation.relationship_name,
          relationship_type: invitation.relationship_type,
          created_by: invitation.from_user_id
        }])
        .select()
        .single()

      if (relationshipError) throw relationshipError

      // Add members
      const { error: membersError } = await supabase
        .from('relationship_members')
        .insert([
          {
            relationship_id: relationshipData.id,
            user_id: invitation.from_user_id,
            role: 'admin'
          },
          {
            relationship_id: relationshipData.id,
            user_id: user.id,
            role: 'member'
          }
        ])

      if (membersError) throw membersError

      // Mark invitation as accepted
      await supabase
        .from('relationship_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

      setMessage('Successfully joined the relationship!')
      setInviteCode('')
      
      router.push(`/onboarding/relationship/${relationshipData.id}?isNew=true`)
      return

    } catch (error: any) {
      console.error('Error accepting invitation:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setJoinLoading(false)
    }
  }

  const leaveRelationship = async () => {
    if (!selectedRelationship || !user) return

    setDeleteLoading(true)
    setMessage('')

    try {
      const { error: leaveError } = await supabase
        .from('relationship_members')
        .delete()
        .eq('relationship_id', selectedRelationship.id)
        .eq('user_id', user.id)

      if (leaveError) throw leaveError

      setMessage(`Successfully left "${selectedRelationship.name}" relationship! 👋`)
      setShowSettingsModal(false)
      setSelectedRelationship(null)

      await loadRelationships()

    } catch (error: any) {
      console.error('Leave error:', error)
      setMessage(`Error leaving relationship: ${error.message}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'romantic':
      case 'couple':
        return <Heart className="w-5 h-5 text-pink-500" />
      case 'family':
        return <Home className="w-5 h-5 text-blue-500" />
      case 'friend':
      case 'friends':
        return <Users className="w-5 h-5 text-green-500" />
      case 'work':
        return <Briefcase className="w-5 h-5 text-gray-600" />
      default:
        return <Heart className="w-5 h-5 text-purple-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Filter to only show pending invitations (hide accepted/expired)
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-slate">Loading your relationships...</p>
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
            <h1 className="text-3xl font-bold text-brand-charcoal">Your Relationships</h1>
            <p className="text-brand-slate mt-2">Connect with people using invitation codes</p>
          </div>
          <Button 
            onClick={() => setShowInviteForm(true)}
            className="bg-brand-teal hover:bg-brand-teal-dark text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Invitation
          </Button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('Error') || message.includes('error') || message.includes('Invalid') || message.includes('expired')
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Join by Code Section */}
        <div className="bg-brand-teal/10 border border-brand-teal/30 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-brand-teal mb-4">
            💝 Have an invitation code?
          </h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="flex-1 px-4 py-3 border border-brand-teal/30 rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal uppercase tracking-wider text-center text-lg font-semibold bg-white"
            />
            <Button
              onClick={acceptInvitation}
              disabled={inviteCode.length !== 6 || joinLoading}
              className="bg-brand-teal hover:bg-brand-teal-dark px-6"
            >
              {joinLoading ? 'Joining...' : 'Join'}
            </Button>
          </div>
        </div>

        {/* Active Relationships - Single Column */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-brand-charcoal">Active Relationships</h2>
          
          {relationships.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-brand-light-gray">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-8 h-8 text-brand-teal" />
              </div>
              <h3 className="text-lg font-semibold text-brand-charcoal mb-2">No relationships yet</h3>
              <p className="text-brand-slate mb-6">Create an invitation code to connect with someone</p>
              <Button 
                onClick={() => setShowInviteForm(true)}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white"
              >
                Create Your First Invitation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {relationships.map((relationship) => (
                <div key={relationship.id} className="bg-white rounded-xl border border-brand-light-gray p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getRelationshipIcon(relationship.relationship_type)}
                      <div>
                        <h3 className="text-lg font-semibold text-brand-charcoal">{relationship.name}</h3>
                        <p className="text-sm text-brand-slate">
                          {relationship.otherMembers.length > 0 
                            ? `with ${relationship.otherMembers[0].users?.full_name || relationship.otherMembers[0].users?.email}`
                            : 'Connection pending'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link href={`/insights?relationship=${relationship.id}`}>
                        <Button size="sm" variant="outline" className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10">
                          Insights
                        </Button>
                      </Link>
                      <Link href={`/onboarding/relationship/${relationship.id}`}>
                        <Button size="sm" variant="outline" className="border-brand-coral-pink/30 text-brand-coral-pink hover:bg-brand-coral-pink/10">
                          Profile
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedRelationship(relationship)
                          setShowSettingsModal(true)
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pending Invitations - Only show if any exist */}
          {pendingInvitations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-brand-charcoal mb-4">Pending Invitations</h3>
              <div className="space-y-3">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-brand-charcoal">{invitation.relationship_name}</h4>
                        <p className="text-sm text-amber-700">
                          Code: <span className="font-mono font-bold">{invitation.invite_code}</span>
                        </p>
                      </div>
                      <Button
                        onClick={() => navigator.clipboard.writeText(invitation.invite_code)}
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keep existing modals but simplify */}
        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-brand-charcoal">Create Invitation</h3>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="text-brand-slate hover:text-brand-charcoal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">
                    Relationship Name
                  </label>
                  <Input
                    value={inviteData.relationshipName}
                    onChange={(e) => setInviteData(prev => ({ ...prev, relationshipName: e.target.value }))}
                    placeholder="Our Relationship"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">
                    Relationship Type
                  </label>
                  <select
                    value={inviteData.relationshipType}
                    onChange={(e) => setInviteData(prev => ({ ...prev, relationshipType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                  >
                    <option value="romantic">💕 Romantic Partnership</option>
                    <option value="family">🏠 Family Relationship</option>
                    <option value="friend">👫 Friendship</option>
                    <option value="work">💼 Work Relationship</option>
                    <option value="other">❤️ Other</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={generateInviteCode}
                    disabled={inviteLoading || !inviteData.relationshipName}
                    className="flex-1 bg-brand-teal hover:bg-brand-teal-dark text-white"
                  >
                    {inviteLoading ? 'Generating...' : 'Generate Code'}
                  </Button>
                  <Button
                    onClick={() => setShowInviteForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Display Modal */}
        {showCodeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-brand-charcoal mb-2">Invitation Code Generated!</h3>
                <p className="text-brand-slate mb-6">Share this code to connect</p>
                
                <div className="bg-brand-cool-gray rounded-lg p-6 mb-6">
                  <div className="text-3xl font-bold font-mono text-brand-teal tracking-wider mb-2">
                    {generatedCode}
                  </div>
                  <Button
                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                    variant="outline"
                    size="sm"
                    className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                </div>

                <Button
                  onClick={() => setShowCodeModal(false)}
                  className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Simplified Settings Modal */}
        {showSettingsModal && selectedRelationship && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-brand-charcoal">Relationship Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-brand-slate hover:text-brand-charcoal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-brand-cool-gray rounded-lg">
                <div className="flex items-center space-x-3">
                  {getRelationshipIcon(selectedRelationship.relationship_type)}
                  <div>
                    <h4 className="font-semibold text-brand-charcoal">{selectedRelationship.name}</h4>
                    <p className="text-sm text-brand-slate">
                      {selectedRelationship.otherMembers.length > 0 
                        ? `with ${selectedRelationship.otherMembers[0].users?.full_name || selectedRelationship.otherMembers[0].users?.email}`
                        : 'Connection pending'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={leaveRelationship}
                  disabled={deleteLoading}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50 justify-start"
                >
                  {deleteLoading ? 'Leaving...' : 'Leave Relationship'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}