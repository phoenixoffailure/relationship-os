'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Check your email for a confirmation link!')
      router.push('/login') // Redirect to login after signup
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSignUp} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="full-name" className="font-inter text-ui-base font-medium text-brand-charcoal">
          Full Name
        </Label>
        <Input
          id="full-name"
          type="text"
          placeholder="John Doe"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border-brand-light-gray focus:ring-brand-teal focus:border-brand-teal font-inter"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email" className="font-inter text-ui-base font-medium text-brand-charcoal">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-brand-light-gray focus:ring-brand-teal focus:border-brand-teal font-inter"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password" className="font-inter text-ui-base font-medium text-brand-charcoal">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-brand-light-gray focus:ring-brand-teal focus:border-brand-teal font-inter"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-brand-teal hover:bg-brand-dark-teal text-white font-inter" 
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </Button>
    </form>
  )
}