import LoginForm from '../components/auth/LoginForm'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function LoginPage({
  searchParams
}: {
  searchParams: { returnTo?: string } & Promise<Record<string, unknown>>
}) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  const decoded = (() => {
    if (!searchParams.returnTo) return undefined
    try {
      return decodeURIComponent(searchParams.returnTo)
    } catch {
      return undefined
    }
  })()
  const returnTo = sanitizeReturnTo(decoded)
  return <LoginForm returnTo={returnTo} />
}

function sanitizeReturnTo(returnTo?: string): string | undefined {
  if (typeof returnTo !== 'string') return undefined
  if (!returnTo.startsWith('/')) return '/'
  if (returnTo.startsWith('//')) return '/'
  if (returnTo.includes('://')) return '/'
  if (returnTo.includes('\\')) return '/'
  const safePathRegex = /^\/[A-Za-z0-9\-._~\/]*$/
  return safePathRegex.test(returnTo) ? returnTo : '/'
}

// Add metadata for the page
export const metadata: Metadata = {
  title: 'Sacred Login - Beatrice Spiritual Companion',
  description: 'Enter your sacred space and continue your spiritual journey with Beatrice, your AI spiritual companion.',
}
