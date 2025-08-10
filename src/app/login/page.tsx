import LoginForm from '../components/auth/LoginForm'
import type { Metadata } from 'next'

/**
 * Renders the login page, passing an optional decoded `returnTo` parameter to the login form.
 *
 * Awaits the provided `searchParams` promise, extracts and decodes the `returnTo` parameter if present, and supplies it to the `LoginForm` component.
 *
 * @param searchParams - A promise resolving to an object that may contain a `returnTo` string indicating the redirect destination after login
 * @returns The login form component with the appropriate redirect parameter
 */
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
