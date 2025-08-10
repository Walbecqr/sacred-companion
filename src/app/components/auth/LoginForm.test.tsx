/**
 * Tests for LoginForm component
 *
 * Assumptions:
 * - Testing framework: Jest (or Vitest with jest-compatible APIs)
 * - Library: @testing-library/react (+ @testing-library/jest-dom in setup)
 * - Next.js App Router; next/navigation is mocked
 * - Supabase client from @supabase/auth-helpers-nextjs is mocked
 *
 * These tests focus on the Login form logic:
 * - Sign in flow (success, error)
 * - Sign up flow: with immediate session (profile insert + redirect) and without session (confirmation required)
 * - Google OAuth flow (success invokes API, error displays message)
 * - UI interactions: toggle password visibility, toggle between Sign In / Sign Up, loading state disabling submit, error rendering and clearing
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// user-event is more realistic but fireEvent is sufficient if user-event isn't present
// import userEvent from '@testing-library/user-event';

import LoginForm from './LoginForm';

// Mocks for next/navigation
jest.mock('next/navigation', () => {
  const push = jest.fn();
  const refresh = jest.fn();
  return {
    useRouter: () => ({ push, refresh })
  };
});

// Helper to get the current mock router references created above
const getMockRouter = () => {
  const { useRouter } = jest.requireMock('next/navigation') as any;
  return useRouter();
};

// Mocks for supabase client
type SupabaseAuthResponse<T=unknown> = { data?: any; error?: null | { message: string }; };
const mockSignInWithPassword = jest.fn<Promise<SupabaseAuthResponse>, any>();
const mockSignUp = jest.fn<Promise<SupabaseAuthResponse>, any>();
const mockSignInWithOAuth = jest.fn<Promise<SupabaseAuthResponse>, any>();
const mockFromInsert = jest.fn<Promise<SupabaseAuthResponse>, any>();
const mockFrom = jest.fn().mockReturnValue({ insert: mockFromInsert });

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth
    },
    from: mockFrom
  })
}));

// Utility helpers
const fillEmail = (value: string) => {
  const email = screen.getByLabelText(/email address/i) as HTMLInputElement;
  fireEvent.change(email, { target: { value } });
  return email;
};

const fillPassword = (value: string) => {
  const password = screen.getByLabelText(/^password$/i) as HTMLInputElement;
  fireEvent.change(password, { target: { value } });
  return password;
};

const clickSubmit = () => {
  const submit = screen.getByRole('button', { name: /enter sacred space|begin journey|creating your sacred space|entering sacred space/i });
  fireEvent.click(submit);
  return submit;
};

const clickToggleMode = () => {
  // The toggle button is the one labeled "Sign Up" or "Sign In" in the footer
  const toggleBtn = screen.getByRole('button', { name: /sign up|sign in/i });
  fireEvent.click(toggleBtn);
  return toggleBtn;
};

beforeEach(() => {
  jest.clearAllMocks();

  // jsdom default origin should be http://localhost, but ensure for consistency
  Object.defineProperty(window, 'location', {
    value: new URL('http://localhost/'),
    writable: true
  });
});

describe('LoginForm - Rendering basics', () => {
  test('renders sign-in view by default', () => {
    render(<LoginForm />);
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter sacred space/i })).toBeInTheDocument();
    // No display name field in sign-in mode
    expect(screen.queryByLabelText(/your name/i)).not.toBeInTheDocument();
  });

  test('can toggle to sign-up view and back', () => {
    render(<LoginForm />);
    // Switch to sign-up
    clickToggleMode();
    expect(screen.getByRole('heading', { name: /begin your journey/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /begin journey/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();

    // Switch back to sign-in
    clickToggleMode();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter sacred space/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/your name/i)).not.toBeInTheDocument();
  });

  test('password visibility toggle switches input type', () => {
    render(<LoginForm />);
    const password = fillPassword('secret');
    expect(password.type).toBe('password');

    // Click the eye icon button to show password
    const toggleBtn = screen.getByRole('button', { name: '' }); // the visibility toggle has no accessible name; it's fine to query by role without name
    fireEvent.click(toggleBtn);
    expect((screen.getByLabelText(/^password$/i) as HTMLInputElement).type).toBe('text');

    // Toggle back
    fireEvent.click(toggleBtn);
    expect((screen.getByLabelText(/^password$/i) as HTMLInputElement).type).toBe('password');
  });
});

describe('LoginForm - Sign in flow', () => {
  test('successful sign in redirects to dashboard and refreshes router when no returnTo given', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    fillEmail('user@example.com');
    fillPassword('hunter2');

    clickSubmit();

    await waitFor(() => {
      const router = getMockRouter();
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'hunter2'
      });
      expect(router.push).toHaveBeenCalledWith('/dashboard');
      expect(router.refresh).toHaveBeenCalled();
    });

    // No error displayed
    expect(screen.queryByText(/an error occurred during authentication/i)).not.toBeInTheDocument();
  });

  test('successful sign in uses returnTo route if provided', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    render(<LoginForm returnTo="/after-login" />);
    fillEmail('user@example.com');
    fillPassword('pw');

    clickSubmit();

    await waitFor(() => {
      const router = getMockRouter();
      expect(router.push).toHaveBeenCalledWith('/after-login');
    });
  });

  test('failed sign in shows error message', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });

    render(<LoginForm />);
    fillEmail('user@example.com');
    fillPassword('wrong');

    clickSubmit();

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test('loading state disables submit button during request', async () => {
    let resolvePromise: (v: any) => void;
    const pending = new Promise((resolve) => { resolvePromise = resolve; });
    mockSignInWithPassword.mockReturnValueOnce(pending as unknown as Promise<any>);

    render(<LoginForm />);
    fillEmail('user@example.com');
    fillPassword('pw');

    const submit = clickSubmit();
    expect(submit).toBeDisabled();

    // resolve request
    resolvePromise!({ error: null });
    await waitFor(() => {
      expect(submit).not.toBeDisabled();
    });
  });
});

describe('LoginForm - Sign up flow', () => {
  test('successful sign up with active session inserts profile and redirects', async () => {
    // signUp returns data with session and user
    const fakeUserId = 'user-123';
    mockSignUp.mockResolvedValueOnce({
      error: null,
      data: {
        session: { access_token: 'token' },
        user: { id: fakeUserId }
      }
    });
    mockFromInsert.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    // Switch to sign-up
    clickToggleMode();

    // Provide inputs
    const displayNameInput = screen.getByLabelText(/your name/i) as HTMLInputElement;
    fireEvent.change(displayNameInput, { target: { value: 'Bea' } });
    fillEmail('user@example.com');
    fillPassword('secretpw');

    clickSubmit();

    await waitFor(() => {
      const router = getMockRouter();
      // signUp called with correct payload including display_name fallback logic
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secretpw',
        options: {
          data: { display_name: 'Bea' }
        }
      });

      // profile insertion with expected defaults
      expect(mockFrom).toHaveBeenCalledWith('user_spiritual_profiles');
      const insertArg = mockFromInsert.mock.calls[0][0];
      expect(insertArg.user_id).toBe(fakeUserId);
      expect(insertArg.display_name).toBe('Bea');
      expect(insertArg.experience_level).toBe('beginner');
      expect(typeof insertArg.created_at).toBe('string');

      expect(router.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('sign up uses email local-part as display_name when none provided', async () => {
    mockSignUp.mockResolvedValueOnce({
      error: null,
      data: {
        session: { access_token: 'token' },
        user: { id: 'user-xyz' }
      }
    });
    mockFromInsert.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    clickToggleMode(); // to sign-up

    fillEmail('localpart@domain.com');
    fillPassword('abcdef');

    clickSubmit();

    await waitFor(() => {
      const insertArg = mockFromInsert.mock.calls[0][0];
      expect(insertArg.display_name).toBe('localpart');
    });
  });

  test('sign up with no active session displays confirmation message', async () => {
    mockSignUp.mockResolvedValueOnce({
      error: null,
      data: {
        session: null,
        user: { id: 'user-abc' }
      }
    });

    render(<LoginForm />);
    clickToggleMode();

    fillEmail('user@example.com');
    fillPassword('abcdef');

    clickSubmit();

    expect(await screen.findByText(/please check your email to confirm/i)).toBeInTheDocument();
    // No redirect
    const router = getMockRouter();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('failed sign up shows error message and does not redirect', async () => {
    mockSignUp.mockResolvedValueOnce({ error: { message: 'Email already registered' } });

    render(<LoginForm />);
    clickToggleMode();

    fillEmail('user@example.com');
    fillPassword('abcdef');

    clickSubmit();

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
    const router = getMockRouter();
    expect(router.push).not.toHaveBeenCalled();
  });

  test('toggling between modes clears error state', async () => {
    // First cause an error in sign-up
    mockSignUp.mockResolvedValueOnce({ error: { message: 'Weak password' } });

    render(<LoginForm />);
    clickToggleMode();
    fillEmail('user@example.com');
    fillPassword('123');
    clickSubmit();

    expect(await screen.findByText(/weak password/i)).toBeInTheDocument();

    // Toggle back to sign-in should clear error
    clickToggleMode(); // back to sign-in
    expect(screen.queryByText(/weak password/i)).not.toBeInTheDocument();
  });
});

describe('LoginForm - Google OAuth', () => {
  test('invokes signInWithOAuth with google provider and proper redirectTo with default returnTo', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);
    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
      const arg = mockSignInWithOAuth.mock.calls[0][0];
      expect(arg.provider).toBe('google');
      expect(arg.options.redirectTo).toContain('http://localhost/auth/callback?returnTo=%2Fdashboard');
    });
  });

  test('invokes signInWithOAuth with custom returnTo when provided', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });

    render(<LoginForm returnTo="/welcome" />);
    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      const arg = mockSignInWithOAuth.mock.calls[0][0];
      expect(arg.options.redirectTo).toContain('/auth/callback?returnTo=%2Fwelcome');
    });
  });

  test('shows error when OAuth fails', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: { message: 'OAuth popup blocked' } });

    render(<LoginForm />);
    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleBtn);

    expect(await screen.findByText(/oauth popup blocked/i)).toBeInTheDocument();
  });
});

describe('LoginForm - Accessibility and labels', () => {
  test('email and password inputs are required', () => {
    render(<LoginForm />);
    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByLabelText(/^password$/i);
    expect(email).toBeRequired();
    expect(password).toBeRequired();
  });
});