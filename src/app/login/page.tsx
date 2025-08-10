import LoginForm from '../components/auth/LoginForm';
import type { Metadata } from 'next';

export default function LoginPage() {
  return <LoginForm />;
}

// Add metadata for the page
export const metadata: Metadata = {
  title: 'Sacred Login - Beatrice Spiritual Companion',
  description: 'Enter your sacred space and continue your spiritual journey with Beatrice, your AI spiritual companion.',
};