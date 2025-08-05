// app/admin/users/page.tsx
// Protected admin page with both admin emails included

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

// Updated admin emails to include both admins
const ADMIN_EMAILS = [
  'jwalkwithyou@gmail.com',
  'Chandellwalker@gmail.com'
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

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

      // Check if user is admin (updated to include both emails)
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
        setMessage(`User deleted successfully!`)
        loadUsers() // Refresh the list
        setShowDeleteConfirm(null)
        setDeleteConfirmText('')
      } else {
        setMessage(`Delete failed: ${result.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      setMessage(`Error deleting user: ${error.message}`)
      console.error('Error deleting user:', error)
    } finally {
      setDeletingUserId(null)
    }
  }

  // Show loading state while checking admin access
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-calm-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  // This should never render due to middleware, but good to have as backup
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have admin privileges.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">RelationshipOS Admin</h1>
          <p className="text-gray-600 mt-2">User Management & System Administration</p>
          <div className="mt-2 text-sm text-calm-600">
            Logged in as: <strong>{currentUser?.email}</strong>
          </div>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.includes('Error') ? 
            'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
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
          {loading ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-calm-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </CardContent>
            </Card>
          ) : users.length === 0 ? (
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
                        <Badge variant="outline" className="text-xs">
                          Protected
                        </Badge>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(user.id)}
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Delete confirmation dialog */}
                  {showDeleteConfirm === user.id && (
                    <div className="mt-4 p-4 border-2 border-red-200 rounded-lg bg-red-50">
                      <h4 className="font-semibold text-red-800 mb-2">
                        ⚠️ Confirm Account Deletion
                      </h4>
                      <p className="text-sm text-red-700 mb-3">
                        This will permanently delete <strong>{user.email}</strong> and all their data. 
                        This action cannot be undone.
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="deleteConfirm" className="text-sm font-medium text-red-800">
                            Type "DELETE" to confirm:
                          </Label>
                          <Input
                            id="deleteConfirm"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="border-red-300 focus:border-red-500"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            disabled={deleteConfirmText !== 'DELETE' || deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? 'Deleting...' : 'Confirm Delete'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowDeleteConfirm(null)
                              setDeleteConfirmText('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}