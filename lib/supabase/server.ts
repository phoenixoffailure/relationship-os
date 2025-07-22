{
  ;`import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types/database'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The \`cookies().set()\` method can only be called from a Server Component or Route Handler
            // in a \`POST\` request.
            // https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The \`cookies().set()\` method can only be called from a Server Component or Route Handler
            // in a \`POST\` request.
            // https://nextjs.org/docs/app/api-reference/functions/cookies#cookiessetname-value-options
          }
        },
      },
    }
  )
}
`
}
