import LoginForm from '../components/auth/LoginForm'
import type { Metadata } from 'next'

interface LoginPageProps {
  searchParams: {
    returnTo?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const returnTo = searchParams.returnTo ? decodeURIComponent(searchParams.returnTo) : undefined
  return <LoginForm returnTo={returnTo} />
}

// Add metadata for the page
export const metadata: Metadata = {
  title: 'Sacred Login - Beatrice Spiritual Companion',
  description: 'Enter your sacred space and continue your spiritual journey with Beatrice, your AI spiritual companion.',
}
