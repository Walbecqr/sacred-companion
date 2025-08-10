import LoginForm from '../components/auth/LoginForm'
import type { Metadata } from 'next'

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const params = await searchParams
  const returnTo = params.returnTo ? decodeURIComponent(params.returnTo) : undefined
  return <LoginForm returnTo={returnTo} />
}

// Add metadata for the page
export const metadata: Metadata = {
  title: 'Sacred Login - Beatrice Spiritual Companion',
  description: 'Enter your sacred space and continue your spiritual journey with Beatrice, your AI spiritual companion.',
}
