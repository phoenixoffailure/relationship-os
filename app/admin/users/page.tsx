// app/admin/users/page.tsx
// Protected admin page with proper authentication

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  email: string
  full_name?: string | null
  created_at: string
  onboarding_completed?: boolean | null
}

// Define admin emails here (for development)
const ADMIN_EMAILS = [
  'jwalkwithyou@gmail.com', // Replace with your actual email
]

export default function AdminUserManagement() {
  // State declarations
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  // Admin authentication states
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/login?message=Please login to access admin panel')
        return
      }

      // Check if user is admin
      const isAdminUser = ADMIN_EMAILS.includes(user.email || '')

      if (!isAdminUser) {
        router.push('/dashboard?message=Access denied: Admin privileges required')
        return
      }

      setCurrentUser(user)
      setIsAdmin(true)
      setAuthLoading(false)
      
      // Load users if admin access confirmed
      loadUsers()
    } catch (error) {
      console.error('Admin access check error:', error)
      router.push('/dashboard?message=Error checking admin access')
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/account/delete', {
        method: 'GET',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load users')
      }

      setUsers(result.users || [])
    } catch (error: any) {
      setMessage(`Error loading users: ${error.message}`)
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage('Please type "DELETE" to confirm')
      return
    }

    // Extra security: prevent deleting your own admin account
    if (userId === currentUser?.id) {
      setMessage('Error: Cannot delete your own admin account')
      return
    }

    setDeletingUserId(userId)
    setMessage('')

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          isAdminDelete: true
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user')
      }

      if (result.success) {
        setMessage(`User deleted successfully! ${result.warning || ''}`)
        setShowDeleteConfirm(null)
        setDeleteConfirmText('')
        // Reload users list
        await loadUsers()
      } else {
        throw new Error(result.error || 'User deletion failed')
      }

    } catch (error: any) {
      setMessage(`Error deleting user: ${error.message}`)
      console.error('User deletion error:', error)
    } finally {
      setDeletingUserId(null)
    }
  }

  const resetDeleteState = () => {
    setShowDeleteConfirm(null)
    setDeleteConfirmText('')
    setMessage('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Show loading while checking admin access
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-calm-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  // Show loading while fetching users
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-calm-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Admin Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-calm-600">Admin: User Management</h1>
            <p className="text-gray-600 mt-2">
              Logged in as: <span className="font-medium">{currentUser?.email}</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-calm-300 text-calm-700"
            >
              👤 Dashboard
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-700"
            >
              🚪 Logout
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.includes('Error') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.includes('Error') ? 'text-red-800' : 'text-green-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">All Users ({users.length})</h2>
            <p className="text-gray-600">Registered users in the system</p>
          </div>
          <Button 
            onClick={loadUsers}
            variant="outline"
            className="border-calm-300 text-calm-700"
          >
            🔄 Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No users found</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {user.full_name || 'No name set'}
                        </h3>
                        <Badge variant={user.onboarding_completed ? "default" : "secondary"}>
                          {user.onboarding_completed ? "Onboarded" : "Pending"}
                        </Badge>
                        {ADMIN_EMAILS.includes(user.email) && (
                          <Badge variant="destructive">ADMIN</Badge>
                        )}
                        {user.id === currentUser?.id && (
                          <Badge variant="outline">YOU</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>User ID:</strong> <code className="bg-gray-100 px-1 rounded">{user.id}</code></p>
                        <p><strong>Created:</strong> {formatDate(user.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Prevent deleting admin users or yourself */}
                      {ADMIN_EMAILS.includes(user.email) || user.id === currentUser?.id ? (
                        <Button
                          disabled
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-400"
                        >
                          🔒 Protected
                        </Button>
                      ) : showDeleteConfirm === user.id ? (
                        <div className="flex flex-col space-y-3 items-end">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-800 mb-2 font-medium">
                              ⚠️ This will permanently delete all user data
                            </p>
                            <div className="space-y-2">
                              <Label htmlFor={`delete-${user.id}`} className="text-xs text-red-700">
                                Type "DELETE" to confirm
                              </Label>
                              <Input
                                id={`delete-${user.id}`}
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="text-sm border-red-300 focus:ring-red-500"
                              />
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => deleteUser(user.id)}
                              disabled={deleteConfirmText !== 'DELETE' || deletingUserId === user.id}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white text-xs"
                            >
                              {deletingUserId === user.id ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                  Deleting...
                                </>
                              ) : (
                                'Confirm Delete'
                              )}
                            </Button>
                            <Button
                              onClick={resetDeleteState}
                              disabled={deletingUserId === user.id}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowDeleteConfirm(user.id)}
                          disabled={deletingUserId !== null}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          🗑️ Delete User
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Security Notice */}
        <Alert className="mt-8 border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>🔐 Security Info:</strong> Admin access is granted to emails in the ADMIN_EMAILS list. 
            Protected accounts (admins and your own account) cannot be deleted. 
            For production, implement database-based role management.
          </AlertDescription>
        </Alert>

        {/* Environment Check */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Environment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Supabase URL:</span>
                <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Admin Status:</span>
                <Badge variant="default">
                  Authenticated
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}