// app/(protected)/relationships/page.tsx
// UPDATED: Added relationship onboarding trigger functionality (Priority 3)

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation' // NEW: Added for navigation

export default function RelationshipsPage() {
  const [user, setUser] = useState<any>(null)
  const [relationships, setRelationships] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false) // NEW: Added join loading state
  const [message, setMessage] = useState('')

  // NEW: Router for navigation
  const router = useRouter()

  // Invite form state
  const [inviteData, setInviteData] = useState({
    partnerName: '',
    relationshipName: '',
    relationshipType: 'couple'
  })

  // Code system state
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedRelationship, setSelectedRelationship] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await Promise.all([
          loadRelationships(user.id),
          loadInvitations(user.id)
        ])
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadRelationships = async (userId: string) => {
    try {
      // Get relationships where user is a member
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
        .eq('user_id', userId)

      if (memberError) throw memberError

      // For each relationship, get the other members
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
            .neq('user_id', userId)

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

      // NEW: Check if any relationships need onboarding
      for (const member of memberData || []) {
        const relationshipId = member.relationship_id
        
        // Check if this is a recent relationship (joined in last 24 hours) without profile
        const joinedAt = new Date(member.joined_at)
        const now = new Date()
        const hoursSinceJoined = (now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60)
        
        if (hoursSinceJoined < 24) {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('relationship_profiles')
            .select('id')
            .eq('user_id', userId)
            .eq('relationship_id', relationshipId)
            .single()
          
          // If no profile and recently joined, suggest onboarding
          if (profileError && profileError.code === 'PGRST116') {
            console.log(`🔍 Recent relationship ${relationshipId} missing onboarding profile`)
            // Optional: Add a banner or auto-redirect to onboarding
            // For now, we'll let the user manually discover this
          }
        }
      }

    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  const loadInvitations = async (userId: string) => {
    try {
      // Get invitations sent by this user
      const { data: sentInvites, error: sentError } = await supabase
        .from('relationship_invitations')
        .select('*')
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false })

      if (sentError) {
        console.error('Error loading sent invitations:', sentError)
      }

      setInvitations((sentInvites || []).map(inv => ({ ...inv, type: 'sent' })))
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }

  // UPDATED: Added relationship onboarding trigger after creation
  const generateInviteCode = async () => {
    if (!user || !inviteData.relationshipName) return

    setInviteLoading(true)
    setMessage('')

    try {
      // Generate a unique 6-character code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      console.log('🔍 DEBUG: Generated code:', code)
      
      // Save invitation with code instead of email
      const { data, error } = await supabase
        .from('relationship_invitations')
        .insert([{
          from_user_id: user.id,
          invite_code: code,
          to_email: null, // No email needed
          relationship_name: inviteData.relationshipName,
          relationship_type: inviteData.relationshipType,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Invitation created:', data.id)
      setGeneratedCode(code)
      setShowCodeModal(true)
      setShowInviteForm(false)
      setInviteData({ partnerName: '', relationshipName: '', relationshipType: 'couple' })
      
      // Reload invitations
      await loadInvitations(user.id)
      
      // NEW: After creating invitation, check if we need relationship onboarding
      // Note: We'll trigger onboarding after the partner accepts the invite
        
    } catch (error: any) {
      console.error('❌ Error generating invite code:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setInviteLoading(false)
    }
  }

  // UPDATED: Added relationship onboarding trigger after joining
  const acceptInvitation = async () => {
    if (!user || !inviteCode.trim()) return

    setJoinLoading(true)
    setMessage('')

    try {
      // STEP 1: Find the invitation
      const { data: invitations, error: findError } = await supabase
        .from('relationship_invitations')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .eq('status', 'pending')

      console.log('🔍 DEBUG: Found invitations:', invitations)

      if (findError) {
        console.log('🔍 DEBUG: Database error:', findError.message)
        setMessage(`Database error: ${findError.message}`)
        return
      }

      if (!invitations || invitations.length === 0) {
        setMessage('Invalid or expired invitation code.')
        return
      }

      const invitation = invitations[0]

      // STEP 2: Enhanced validation checks
      console.log('🔍 DEBUG: Running validation checks...')

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        setMessage('This invitation code has expired.')
        return
      }

      // Check self-invitation
      if (invitation.from_user_id === user.id) {
        setMessage('You cannot accept your own invitation!')
        return
      }

      // STEP 3: Check for existing relationship between these users
      console.log('🔍 DEBUG: Checking for existing relationships...')
      const { data: existingMembers, error: existingError } = await supabase
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

      if (existingError) {
        console.log('🔍 DEBUG: Error checking existing relationships:', existingError)
      } else if (existingMembers) {
        const hasExistingRelationship = existingMembers.some((member: any) => {
          const relationship = member.relationships
          return relationship && relationship.created_by === invitation.from_user_id
        })

        if (hasExistingRelationship) {
          setMessage('You are already connected with this person!')
          return
        }
      }

      // STEP 4: Check if invitation was already accepted
      const { data: acceptedInvitations, error: acceptedError } = await supabase
        .from('relationship_invitations')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .eq('status', 'accepted')

      if (acceptedInvitations && acceptedInvitations.length > 0) {
        setMessage('This invitation code has already been used.')
        return
      }

      console.log('🔍 DEBUG: All validation checks passed. Creating relationship...')

      // STEP 5: Create the relationship
      const { data: relationshipData, error: relationshipError } = await supabase
        .from('relationships')
        .insert([{
          name: invitation.relationship_name,
          relationship_type: invitation.relationship_type,
          created_by: invitation.from_user_id
        }])
        .select()
        .single()

      console.log('🔍 DEBUG: Relationship created:', relationshipData)

      if (relationshipError) throw relationshipError

      // STEP 6: Add relationship members
      console.log('🔍 DEBUG: Adding relationship members...')
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

      // STEP 7: Mark invitation as accepted
      console.log('🔍 DEBUG: Marking invitation as accepted...')
      const { error: updateError } = await supabase
        .from('relationship_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

      if (updateError) {
        console.log('🔍 DEBUG: Warning - Could not invalidate invitation code:', updateError)
      } else {
        console.log('🔍 DEBUG: Invitation successfully marked as accepted')
      }

      setMessage('Successfully joined the relationship!')
      setInviteCode('')
      
      // NEW: Redirect to relationship onboarding
      console.log('🔍 DEBUG: Redirecting to relationship onboarding...')
      router.push(`/onboarding/relationship/${relationshipData.id}?isNew=true`)
      return // Exit early to prevent reloading relationships

    } catch (error: any) {
      console.error('❌ Error accepting invitation:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setJoinLoading(false)
    }
  }

  // NEW: Helper function to check if relationship onboarding is needed
  const checkAndTriggerOnboarding = async (relationshipId: string) => {
    if (!user) return

    try {
      // Check if user has completed relationship onboarding for this relationship
      const { data: profile, error } = await supabase
        .from('relationship_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('relationship_id', relationshipId)
        .single()

      // If no profile exists, trigger onboarding
      if (error && error.code === 'PGRST116') {
        console.log('🔍 No relationship profile found, triggering onboarding...')
        router.push(`/onboarding/relationship/${relationshipId}?isNew=true`)
      }
    } catch (error) {
      console.error('Error checking relationship onboarding status:', error)
    }
  }

  // Settings modal functions
  const openRelationshipSettings = (relationship: any) => {
    setSelectedRelationship(relationship)
    setShowSettingsModal(true)
    setShowDeleteConfirm(false)
    setDeleteConfirmText('')
  }

  const deleteRelationship = async () => {
    if (!selectedRelationship || deleteConfirmText !== 'DELETE') return

    setDeleteLoading(true)
    setMessage('')

    try {
      console.log('🔍 DEBUG: Deleting relationship:', selectedRelationship.id)

      // Step 1: Delete all relationship members
      const { error: membersError } = await supabase
        .from('relationship_members')
        .delete()
        .eq('relationship_id', selectedRelationship.id)

      if (membersError) {
        console.error('Error deleting members:', membersError)
        throw membersError
      }

      // Step 2: Delete related insights (optional - they might cascade)
      const { error: insightsError } = await supabase
        .from('relationship_insights')
        .delete()
        .eq('relationship_id', selectedRelationship.id)

      if (insightsError) {
        console.log('Warning: Could not delete insights:', insightsError)
        // Don't fail for this - insights might not exist or might cascade
      }

      // Step 3: Delete the relationship itself
      const { error: relationshipError } = await supabase
        .from('relationships')
        .delete()
        .eq('id', selectedRelationship.id)

      if (relationshipError) {
        console.error('Error deleting relationship:', relationshipError)
        throw relationshipError
      }

      setMessage(`Successfully deleted "${selectedRelationship.name}" relationship! 🗑️`)
      setShowSettingsModal(false)
      setSelectedRelationship(null)
      setDeleteConfirmText('')

      // Reload relationships data
      await loadRelationships(user.id)

    } catch (error: any) {
      console.error('Delete error:', error)
      setMessage(`Error deleting relationship: ${error.message}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const leaveRelationship = async () => {
    if (!selectedRelationship || !user) return

    setDeleteLoading(true)
    setMessage('')

    try {
      console.log('🔍 DEBUG: Leaving relationship:', selectedRelationship.id)

      // Remove user from relationship members
      const { error: leaveError } = await supabase
        .from('relationship_members')
        .delete()
        .eq('relationship_id', selectedRelationship.id)
        .eq('user_id', user.id)

      if (leaveError) throw leaveError

      setMessage(`Successfully left "${selectedRelationship.name}" relationship! 👋`)
      setShowSettingsModal(false)
      setSelectedRelationship(null)

      // Reload relationships data
      await loadRelationships(user.id)

    } catch (error: any) {
      console.error('Leave error:', error)
      setMessage(`Error leaving relationship: ${error.message}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  const getRelationshipTypeIcon = (type: string) => {
    switch (type) {
      case 'couple': return '💕'
      case 'family': return '👨‍👩‍👧‍👦'
      case 'friends': return '👫'
      case 'work': return '🤝'
      case 'poly': return '💖'
      default: return '❤️'
    }
  }

  const getRelationshipTypeLabel = (type: string) => {
    switch (type) {
      case 'couple': return 'Romantic Partnership'
      case 'family': return 'Family Relationship'
      case 'friends': return 'Friendship'
      case 'work': return 'Work Relationship'
      case 'poly': return 'Polyamorous'
      default: return 'Custom Relationship'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const sentInvites = invitations.filter(inv => inv.type === 'sent')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-light-gray border-t-brand-teal rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-heading-xl font-bold text-brand-charcoal font-heading">Your Relationships</h2>
                <p className="text-brand-slate mt-2 font-inter">
                  Connect with partners using invitation codes
                </p>
              </div>
              <Button 
                onClick={() => setShowInviteForm(true)}
                className="bg-brand-teal hover:bg-brand-dark-teal"
              >
                + Create Invitation
              </Button>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.includes('Error') || message.includes('error') || message.includes('Invalid') || message.includes('expired')
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                <span className="font-inter">{message}</span>
              </div>
            )}
          </div>

          {/* Join by Code Section */}
          <div className="bg-brand-teal/10 border border-brand-teal/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-brand-dark-teal mb-4 font-heading">
              💝 Have an invitation code?
            </h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="flex-1 px-4 py-3 border border-brand-teal/30 rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal uppercase tracking-wider text-center text-lg font-semibold font-inter bg-white"
              />
              <Button
                onClick={acceptInvitation}
                disabled={inviteCode.length !== 6 || joinLoading}
                className="bg-brand-teal hover:bg-brand-dark-teal px-6"
              >
                {joinLoading ? 'Joining...' : 'Join Relationship'}
              </Button>
            </div>
            <p className="text-sm text-brand-dark-teal mt-2 font-inter">
              Your partner can share their invitation code with you to connect your accounts
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Connected Relationships */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-brand-light-gray">
              <h3 className="text-xl font-bold text-brand-charcoal mb-6 font-heading">Connected Relationships</h3>
              
              {relationships.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-brand-light-gray mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-brand-slate mb-4 font-inter">No connected relationships yet</p>
                  <p className="text-sm text-brand-slate mb-4 font-inter">
                    Create an invitation code to connect with your partner
                  </p>
                  <Button 
                    onClick={() => setShowInviteForm(true)}
                    className="bg-brand-teal hover:bg-brand-dark-teal"
                  >
                    Create Your First Invitation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {relationships.map((relationship) => (
                    <div key={relationship.id} className="border border-brand-light-gray rounded-lg p-4 hover:bg-brand-cool-gray transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getRelationshipTypeIcon(relationship.relationship_type)}</span>
                          <div>
                            <h4 className="font-semibold text-brand-charcoal font-inter">{relationship.name}</h4>
                            <p className="text-sm text-brand-slate font-inter">{getRelationshipTypeLabel(relationship.relationship_type)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium font-inter ${
                          relationship.myRole === 'admin' 
                            ? 'bg-brand-coral-pink/20 text-brand-coral-pink' 
                            : 'bg-brand-teal/20 text-brand-teal'
                        }`}>
                          {relationship.myRole}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-brand-slate font-inter">
                          <span className="font-medium">Connected since:</span> {formatDate(relationship.joinedAt)}
                        </div>
                        
                        {relationship.otherMembers.length > 0 && (
                          <div className="text-sm text-brand-slate font-inter">
                            <span className="font-medium">Partners:</span>
                            <div className="mt-1 space-y-1">
                              {relationship.otherMembers.map((member: any) => (
                                <div key={member.user_id} className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span>{member.users?.full_name || member.users?.email}</span>
                                  <span className="text-xs text-brand-slate">({member.role})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-brand-light-gray">
                        <div className="flex space-x-2">
                          <Link href={`/insights?relationship=${relationship.id}`}>
                            <Button size="sm" variant="outline" className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10">
                              View Shared Insights
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-brand-light-gray hover:bg-brand-cool-gray"
                            onClick={() => openRelationshipSettings(relationship)}
                          >
                            Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invitation Management */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-brand-light-gray">
              <h3 className="text-xl font-bold text-brand-charcoal mb-6 font-heading">Invitation Codes</h3>
              
              {sentInvites.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-brand-light-gray mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-brand-slate font-inter">No invitation codes created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentInvites.map((invitation) => (
                    <div key={invitation.id} className="border border-brand-light-gray rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-brand-charcoal font-inter">{invitation.relationship_name}</h5>
                          <p className="text-sm text-brand-slate font-inter">Code: <span className="font-mono font-bold">{invitation.invite_code}</span></p>
                          <p className="text-xs text-brand-slate font-inter">
                            Created {formatDate(invitation.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium font-inter ${
                            invitation.status === 'pending' ? 'bg-brand-warm-peach/20 text-orange-700' :
                            invitation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            invitation.status === 'declined' ? 'bg-red-100 text-red-700' :
                            'bg-brand-light-gray text-brand-slate'
                          }`}>
                            {invitation.status}
                          </span>
                          {invitation.status === 'pending' && (
                            <Button
                              onClick={() => navigator.clipboard.writeText(invitation.invite_code)}
                              size="sm"
                              variant="ghost"
                              className="mt-1 text-xs hover:bg-brand-teal/10"
                            >
                              📋 Copy
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-brand-light-gray">
                <h4 className="font-semibold text-brand-charcoal mb-3 font-inter">How Invitation Codes Work</h4>
                <ul className="text-sm text-brand-slate space-y-2 font-inter">
                  <li className="flex items-start space-x-2">
                    <span className="text-brand-teal">•</span>
                    <span>Create a unique 6-character code</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand-teal">•</span>
                    <span>Share the code with your partner</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand-teal">•</span>
                    <span>They enter it above to connect</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand-teal">•</span>
                    <span>Codes expire after 7 days</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rest of the modals remain the same - Invite Form Modal, Code Display Modal, Settings Modal */}
          {/* ... (keeping existing modal code) ... */}
          
          {/* Invite Form Modal */}
          {showInviteForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-brand-charcoal font-heading">Create Invitation Code</h3>
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
                    <label htmlFor="partnerName" className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                      Partner's Name (Optional)
                    </label>
                    <input
                      id="partnerName"
                      type="text"
                      value={inviteData.partnerName}
                      onChange={(e) => setInviteData(prev => ({ ...prev, partnerName: e.target.value }))}
                      className="w-full px-4 py-3 border border-brand-light-gray rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal font-inter"
                      placeholder="Your partner's name"
                    />
                  </div>

                  <div>
                    <label htmlFor="relationshipName" className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                      Relationship Name
                    </label>
                    <input
                      id="relationshipName"
                      type="text"
                      value={inviteData.relationshipName}
                      onChange={(e) => setInviteData(prev => ({ ...prev, relationshipName: e.target.value }))}
                      className="w-full px-4 py-3 border border-brand-light-gray rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal font-inter"
                      placeholder="Our Relationship"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="relationshipType" className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                      Relationship Type
                    </label>
                    <select
                      id="relationshipType"
                      value={inviteData.relationshipType}
                      onChange={(e) => setInviteData(prev => ({ ...prev, relationshipType: e.target.value }))}
                      className="w-full px-4 py-3 border border-brand-light-gray rounded-lg focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal font-inter"
                    >
                      <option value="couple">💕 Romantic Partnership</option>
                      <option value="family">👨‍👩‍👧‍👦 Family Relationship</option>
                      <option value="friends">👫 Friendship</option>
                      <option value="poly">💖 Polyamorous</option>
                      <option value="custom">❤️ Custom</option>
                    </select>
                  </div>

                  <div className="bg-brand-teal/10 border border-brand-teal/20 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-brand-teal mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm">
                        <p className="font-medium text-brand-dark-teal mb-1 font-inter">How This Works</p>
                        <p className="text-brand-dark-teal font-inter">
                          We'll generate a unique code you can share with your partner. 
                          No emails needed - just share the code!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={generateInviteCode}
                      disabled={inviteLoading || !inviteData.relationshipName}
                      className="flex-1 bg-brand-teal hover:bg-brand-dark-teal"
                    >
                      {inviteLoading ? 'Generating...' : 'Generate Code'}
                    </Button>
                    <Button
                      onClick={() => setShowInviteForm(false)}
                      variant="outline"
                      className="flex-1 border-brand-light-gray"
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
                  <h3 className="text-xl font-bold text-brand-charcoal mb-2 font-heading">Invitation Code Generated!</h3>
                  <p className="text-brand-slate mb-6 font-inter">Share this code with your partner to connect</p>
                  
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
                      📋 Copy Code
                    </Button>
                  </div>

                  <div className="text-sm text-brand-slate mb-6 font-inter">
                    <p>✅ Code expires in 7 days</p>
                    <p>✅ Can only be used once</p>
                    <p>✅ Your partner enters this code to connect</p>
                  </div>

                  <Button
                    onClick={() => setShowCodeModal(false)}
                    className="w-full bg-brand-teal hover:bg-brand-dark-teal"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Modal - keeping existing implementation */}
          {showSettingsModal && selectedRelationship && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-brand-charcoal font-heading">Relationship Settings</h3>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-brand-slate hover:text-brand-charcoal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Relationship Info */}
                <div className="mb-6 p-4 bg-brand-cool-gray rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getRelationshipTypeIcon(selectedRelationship.relationship_type)}</span>
                    <div>
                      <h4 className="font-semibold text-brand-charcoal font-inter">{selectedRelationship.name}</h4>
                      <p className="text-sm text-brand-slate font-inter">{getRelationshipTypeLabel(selectedRelationship.relationship_type)}</p>
                    </div>
                  </div>
                  <div className="text-sm text-brand-slate font-inter">
                    <p>Your role: <span className="font-medium">{selectedRelationship.myRole}</span></p>
                    <p>Connected: {formatDate(selectedRelationship.joinedAt)}</p>
                    <p>Partners: {selectedRelationship.otherMembers.length}</p>
                  </div>
                </div>

                {!showDeleteConfirm ? (
                  <div className="space-y-4">
                    {/* View Insights */}
                    <Link href={`/insights?relationship=${selectedRelationship.id}`}>
                      <Button className="w-full bg-brand-teal hover:bg-brand-dark-teal justify-start">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View Shared Insights
                      </Button>
                    </Link>

                    {/* Privacy Settings */}
                    <Button 
                      variant="outline" 
                      className="w-full border-brand-light-gray justify-start hover:bg-brand-cool-gray"
                      onClick={() => {
                        setShowSettingsModal(false)
                        window.location.href = `/settings?relationship=${selectedRelationship.id}`
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Privacy & Sharing Settings
                    </Button>

                    {/* Danger Zone */}
                    <div className="pt-4 border-t border-brand-light-gray">
                      <h4 className="font-medium text-brand-charcoal mb-3 font-inter">Danger Zone</h4>
                      
                      {selectedRelationship.myRole === 'admin' ? (
                        <Button
                          onClick={() => setShowDeleteConfirm(true)}
                          variant="outline"
                          className="w-full border-red-300 text-red-700 hover:bg-red-50 justify-start"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Entire Relationship
                        </Button>
                      ) : (
                        <Button
                          onClick={leaveRelationship}
                          disabled={deleteLoading}
                          variant="outline"
                          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 justify-start"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {deleteLoading ? 'Leaving...' : 'Leave Relationship'}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Delete Confirmation */
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2 font-inter">⚠️ Permanent Deletion</h4>
                      <p className="text-sm text-red-700 mb-3 font-inter">
                        This will permanently delete "{selectedRelationship.name}" and remove all members, insights, and data. This action cannot be undone.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                        Type "DELETE" to confirm
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-inter"
                        placeholder="DELETE"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={deleteRelationship}
                        disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText('')
                        }}
                        variant="outline"
                        className="flex-1 border-brand-light-gray"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}