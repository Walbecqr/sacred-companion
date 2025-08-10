/**
 * Test framework and libraries:
 * - No test framework detected in this repository. Tests are authored to work with:
 *   - Jest (preferred) or
 *   - Vitest (compatible via vi → jest shim below)
 * - @testing-library/react is used for rendering assertions.
 *
 * Focused behaviors (from the diff in page.tsx):
 * - Decoding of returnTo via decodeURIComponent
 * - Passing decoded value into LoginForm
 * - Exported metadata correctness
 * - Error/failure paths (invalid encodings, rejected searchParams)
 *
 * To run:
 * - Install dev deps (example):
 *   - Jest: npm i -D jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
 *   - or Vitest: npm i -D vitest @testing-library/react @testing-library/jest-dom
 * - Configure your runner, then execute tests.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'

/**
 * Minimal global declarations so TypeScript doesn't require @types/jest/@types/vitest
 * during regular type-checking. Test runners will provide real implementations at runtime.
 */
declare const describe: (name: string, fn: () => void) => void
declare const test: (name: string, fn: () => Promise<void> | void) => void
declare const expect: any
declare const beforeAll: (fn: () => Promise<void> | void) => void
declare const vi: any  // Vitest global (ambient)

/**
 * Shim: if running under Vitest, alias vi → jest for API compatibility.
 * Jest also works directly. If neither is present, we leave a helpful error.
 */
const g: any = globalThis as any
if (!g.jest && typeof vi !== 'undefined') {
  g.jest = vi
}
if (!g.jest) {
  // Provide a helpful error guidance and a stub for .mock to avoid ReferenceErrors in editors.
  g.jest = {
    mock: () => {
      throw new Error('No test runner detected. Please run tests using Jest or Vitest.')
    }
  }
}

/**
 * Mock LoginForm BEFORE importing the module under test so that the mock is applied.
 * We expose the received returnTo prop via a data attribute for straightforward assertions.
 */
g.jest.mock('../components/auth/LoginForm', () => {
  return {
    __esModule: true,
    default: (props: any) =>
      React.createElement(
        'div',
        { 'data-testid': 'login-form', 'data-return-to': props.returnTo ?? '' },
        'Mocked LoginForm'
      )
  }
})

let LoginPage: any
let metadata: any

beforeAll(async () => {
  const mod = await import('./page')
  LoginPage = mod.default
  metadata = mod.metadata
})

describe('LoginPage', () => {
  test('renders LoginForm with undefined returnTo when searchParams is empty object', async () => {
    const element = await LoginPage({
      // Implementation awaits a Promise<{ returnTo?: string }>, we pass an empty object.
      // @ts-expect-error intentionally testing missing property shape
      searchParams: Promise.resolve({})
    })

    const rtl: any = await import('@testing-library/react')
    const { screen } = rtl.render(element as React.ReactElement)

    const form = screen.getByTestId('login-form')
    expect(form.getAttribute('data-return-to')).toBe('')
  })

  test('passes decoded returnTo to LoginForm when provided (encoded path/query)', async () => {
    const raw = encodeURIComponent('/dashboard?from=login')
    const element = await LoginPage({
      searchParams: Promise.resolve({ returnTo: raw })
    })

    const rtl: any = await import('@testing-library/react')
    const { screen } = rtl.render(element as React.ReactElement)

    const form = screen.getByTestId('login-form')
    expect(form.getAttribute('data-return-to')).toBe('/dashboard?from=login')
  })

  test('returns unchanged when returnTo is already decoded', async () => {
    const plain = '/already/decoded?x=1&y=2'
    const element = await LoginPage({
      searchParams: Promise.resolve({ returnTo: plain })
    })

    const rtl: any = await import('@testing-library/react')
    const { screen } = rtl.render(element as React.ReactElement)

    const form = screen.getByTestId('login-form')
    expect(form.getAttribute('data-return-to')).toBe(plain)
  })

  test('decodes complex percent-encoded values (spaces and unicode)', async () => {
    const target = '/path with space/über?x=1&y=2'
    const raw = encodeURIComponent(target)
    const element = await LoginPage({
      searchParams: Promise.resolve({ returnTo: raw })
    })

    const rtl: any = await import('@testing-library/react')
    const { screen } = rtl.render(element as React.ReactElement)

    const form = screen.getByTestId('login-form')
    expect(form.getAttribute('data-return-to')).toBe(target)
  })

  test('handles invalid percent-encoding by rejecting with URIError', async () => {
    // Invalid (truncated) percent-encoding should cause decodeURIComponent to throw
    const invalid = '%E0%A4%A' // missing one hex digit
    await expect(
      LoginPage({
        searchParams: Promise.resolve({ returnTo: invalid })
      })
    ).rejects.toBeInstanceOf(URIError)
  })

  test('propagates rejection when searchParams Promise rejects', async () => {
    await expect(
      LoginPage({
        searchParams: Promise.reject(new Error('search params failed'))
      })
    ).rejects.toThrow('search params failed')
  })

  test('metadata exports correct title and description', () => {
    expect(metadata).toBeDefined()
    expect(metadata.title).toBe('Sacred Login - Beatrice Spiritual Companion')
    expect(metadata.description).toBe(
      'Enter your sacred space and continue your spiritual journey with Beatrice, your AI spiritual companion.'
    )
  })

  test('returns a valid React element', async () => {
    const element = await LoginPage({
      searchParams: Promise.resolve({ returnTo: undefined })
    })
    expect(React.isValidElement(element)).toBe(true)
  })
})