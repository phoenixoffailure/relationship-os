'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function RelationshipsPage() {
  const [user, setUser] = useState<any>(null)
  const [relationships, setRelationships] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Invite form state
  const [inviteData, setInviteData] = useState({
    partnerName: '',
    relationshipName: '',
    relationshipType: 'couple'
  })

  // New code system state
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [inviteCode, setInviteCode] = useState('')

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

      console.log('🔍 DEBUG: Insert result:', data)
      console.log('🔍 DEBUG: Insert error:', error)

      if (error) throw error

      setGeneratedCode(code)
      setShowCodeModal(true)
      setShowInviteForm(false)
      setInviteData({ partnerName: '', relationshipName: '', relationshipType: 'couple' })
      
      // Reload invitations
      await loadInvitations(user.id)
        
    } catch (error: any) {
      console.log('🔍 DEBUG: Generation error:', error)
      setMessage(`Error: ${error.message}`)
    } finally {
      setInviteLoading(false)
    }
  }

 const acceptInvitationByCode = async () => {
  if (!user || !inviteCode.trim()) return

  setMessage('')
  console.log('🔍 DEBUG: Starting invitation acceptance')
  console.log('🔍 DEBUG: User ID:', user?.id)
  console.log('🔍 DEBUG: Invite Code:', inviteCode.toUpperCase())

  try {
    // ENHANCED DEBUG: First check if ANY invitations exist
    console.log('🔍 DEBUG: Checking all invitations in database...')
    const { data: allInvitations, error: allError } = await supabase
      .from('relationship_invitations')
      .select('*')

    console.log('🔍 DEBUG: All invitations:', allInvitations)
    console.log('🔍 DEBUG: All invitations error:', allError)
    console.log('🔍 DEBUG: Total invitation count:', allInvitations?.length || 0)

    // ENHANCED DEBUG: Check specific code with different approaches
    console.log('🔍 DEBUG: Looking for invitation with multiple methods...')
    
    // Method 1: Exact case match
    const { data: exactMatch, error: exactError } = await supabase
      .from('relationship_invitations')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())

    console.log('🔍 DEBUG: Exact match results:', exactMatch)
    console.log('🔍 DEBUG: Exact match error:', exactError)

    // Method 2: Case insensitive search
    const { data: caseInsensitive, error: caseError } = await supabase
      .from('relationship_invitations')
      .select('*')
      .ilike('invite_code', inviteCode.toUpperCase())

    console.log('🔍 DEBUG: Case insensitive results:', caseInsensitive)
    console.log('🔍 DEBUG: Case insensitive error:', caseError)

    // Method 3: Check pending status separately
    const { data: pendingOnly, error: pendingError } = await supabase
      .from('relationship_invitations')
      .select('*')
      .eq('status', 'pending')

    console.log('🔍 DEBUG: All pending invitations:', pendingOnly)
    console.log('🔍 DEBUG: Pending error:', pendingError)

    // Use the working method
    let foundInvitations = exactMatch || caseInsensitive || []
    
    // Filter for pending and matching code manually if needed
    const matchingInvitations = foundInvitations.filter(inv => 
      inv.invite_code?.toUpperCase() === inviteCode.toUpperCase() && 
      inv.status === 'pending'
    )

    console.log('🔍 DEBUG: Manually filtered invitations:', matchingInvitations)

    if (!matchingInvitations || matchingInvitations.length === 0) {
      // ENHANCED ERROR: Provide more specific feedback
      if (allInvitations && allInvitations.length > 0) {
        const codes = allInvitations.map(inv => inv.invite_code).join(', ')
        console.log('🔍 DEBUG: Available codes in database:', codes)
        setMessage(`Code not found. Available codes: ${codes}`)
      } else {
        setMessage('No invitations found in database. Please create an invitation first.')
      }
      return
    }

    // Get the first matching invitation
    const invitation = matchingInvitations[0]
    console.log('🔍 DEBUG: Using invitation:', invitation)

    // Check if not expired
    if (new Date(invitation.expires_at) < new Date()) {
      setMessage('This invitation code has expired.')
      return
    }

    // Check if user is trying to accept their own invitation
    if (invitation.from_user_id === user.id) {
      setMessage('You cannot accept your own invitation!')
      return
    }

    console.log('🔍 DEBUG: Creating relationship...')
    // Create the relationship
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
    console.log('🔍 DEBUG: Relationship error:', relationshipError)

    if (relationshipError) throw relationshipError

    console.log('🔍 DEBUG: Adding relationship members...')
    // Add both users as members
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

    console.log('🔍 DEBUG: Members error:', membersError)
    if (membersError) throw membersError

    console.log('🔍 DEBUG: Updating invitation status...')
    // Update invitation status
    const { error: updateError } = await supabase
      .from('relationship_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)

    console.log('🔍 DEBUG: Update error:', updateError)
    if (updateError) throw updateError

    setMessage('Successfully joined the relationship! 🎉')
    setInviteCode('')
    
    // Reload data
    await Promise.all([
      loadRelationships(user.id),
      loadInvitations(user.id)
    ])

  } catch (error: any) {
    console.error('🔍 DEBUG: Full error:', error)
    setMessage(`Error: ${error.message}`)
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
      <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-calm-800">Relationship OS</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-700">
                Dashboard
              </Link>
              <Link href="/journal" className="text-gray-600 hover:text-gray-700">
                Journal
              </Link>
              <Link href="/checkin" className="text-gray-600 hover:text-gray-700">
                Check-In
              </Link>
              <Link href="/insights" className="text-gray-600 hover:text-gray-700">
                Insights
              </Link>
              <Link href="/relationships" className="text-calm-700 hover:text-calm-800 font-medium">
                Relationships
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-700">
                Settings
              </Link>
              <Button 
                variant="ghost" 
                className="text-gray-600"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Relationships</h2>
              <p className="text-gray-600 mt-2">
                Connect with partners using invitation codes
              </p>
            </div>
            <Button 
              onClick={() => setShowInviteForm(true)}
              className="bg-calm-600 hover:bg-calm-700"
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
              {message}
            </div>
          )}
        </div>

        {/* Join by Code Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💝 Have an invitation code?
          </h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              maxLength={6}
              className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase tracking-wider text-center text-lg font-semibold"
            />
            <Button
              onClick={acceptInvitationByCode}
              disabled={inviteCode.length !== 6}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              Join Relationship
            </Button>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Your partner can share their invitation code with you to connect your accounts
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connected Relationships */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Connected Relationships</h3>
            
            {relationships.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-500 mb-4">No connected relationships yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Create an invitation code to connect with your partner
                </p>
                <Button 
                  onClick={() => setShowInviteForm(true)}
                  className="bg-calm-600 hover:bg-calm-700"
                >
                  Create Your First Invitation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {relationships.map((relationship) => (
                  <div key={relationship.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getRelationshipTypeIcon(relationship.relationship_type)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{relationship.name}</h4>
                          <p className="text-sm text-gray-600">{getRelationshipTypeLabel(relationship.relationship_type)}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        relationship.myRole === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {relationship.myRole}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Connected since:</span> {formatDate(relationship.joinedAt)}
                      </div>
                      
                      {relationship.otherMembers.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Partners:</span>
                          <div className="mt-1 space-y-1">
                            {relationship.otherMembers.map((member: any) => (
                              <div key={member.user_id} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span>{member.users?.full_name || member.users?.email}</span>
                                <span className="text-xs text-gray-500">({member.role})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <Link href={`/insights?relationship=${relationship.id}`}>
                          <Button size="sm" variant="outline" className="border-calm-300 text-calm-700">
                            View Shared Insights
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="border-gray-300">
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Invitation Codes</h3>
            
            {sentInvites.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No invitation codes created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentInvites.map((invitation) => (
                  <div key={invitation.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{invitation.relationship_name}</h5>
                        <p className="text-sm text-gray-600">Code: <span className="font-mono font-bold">{invitation.invite_code}</span></p>
                        <p className="text-xs text-gray-500">
                          Created {formatDate(invitation.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          invitation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          invitation.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {invitation.status}
                        </span>
                        {invitation.status === 'pending' && (
                          <Button
                            onClick={() => navigator.clipboard.writeText(invitation.invite_code)}
                            size="sm"
                            variant="ghost"
                            className="mt-1 text-xs"
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

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">How Invitation Codes Work</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-calm-600">•</span>
                  <span>Create a unique 6-character code</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-calm-600">•</span>
                  <span>Share the code with your partner</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-calm-600">•</span>
                  <span>They enter it above to connect</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-calm-600">•</span>
                  <span>Codes expire after 7 days</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Invite Form Modal */}
        {showInviteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create Invitation Code</h3>
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="partnerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Partner's Name (Optional)
                  </label>
                  <input
                    id="partnerName"
                    type="text"
                    value={inviteData.partnerName}
                    onChange={(e) => setInviteData(prev => ({ ...prev, partnerName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                    placeholder="Your partner's name"
                  />
                </div>

                <div>
                  <label htmlFor="relationshipName" className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship Name
                  </label>
                  <input
                    id="relationshipName"
                    type="text"
                    value={inviteData.relationshipName}
                    onChange={(e) => setInviteData(prev => ({ ...prev, relationshipName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                    placeholder="Our Relationship"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="relationshipType" className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship Type
                  </label>
                  <select
                    id="relationshipType"
                    value={inviteData.relationshipType}
                    onChange={(e) => setInviteData(prev => ({ ...prev, relationshipType: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                  >
                    <option value="couple">💕 Romantic Partnership</option>
                    <option value="family">👨‍👩‍👧‍👦 Family Relationship</option>
                    <option value="friends">👫 Friendship</option>
                    <option value="poly">💖 Polyamorous</option>
                    <option value="custom">❤️ Custom</option>
                  </select>
                </div>

                <div className="bg-calm-50 border border-calm-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-calm-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-calm-800 mb-1">How This Works</p>
                      <p className="text-calm-700">
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
                    className="flex-1 bg-calm-600 hover:bg-calm-700"
                  >
                    {inviteLoading ? 'Generating...' : 'Generate Code'}
                  </Button>
                  <Button
                    onClick={() => setShowInviteForm(false)}
                    variant="outline"
                    className="flex-1 border-gray-300"
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
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Invitation Code Generated!</h3>
                <p className="text-gray-600 mb-6">Share this code with your partner:</p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="text-3xl font-bold font-mono tracking-wider text-calm-600 mb-2">
                    {generatedCode}
                  </div>
                  <Button
                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                  >
                    📋 Copy Code
                  </Button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Instructions for your partner:</strong><br/>
                    1. Go to the Relationships page<br/>
                    2. Enter this code in the "Have an invitation code?" section<br/>
                    3. Click "Join Relationship"
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowCodeModal(false)}
                    className="flex-1 bg-calm-600 hover:bg-calm-700"
                  >
                    Done
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(`Hi! I'd like to connect our accounts on Relationship OS. Please use this invitation code: ${generatedCode}`)
                    }}
                    variant="outline"
                    className="flex-1 border-calm-300 text-calm-700"
                  >
                    📱 Copy Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}