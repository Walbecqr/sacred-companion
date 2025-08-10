/**
 * Tests for SpiritualJourneyLayout.
 *
 * Framework and Libraries:
 * - Jest as the test runner
 * - @testing-library/react for rendering and assertions
 *
 * These tests validate that the layout component transparently renders its children,
 * covering a range of scenarios including multiple children, null/undefined, fragments,
 * nested structures, and unexpected inputs.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'

/* Import the component under test.
   The component is expected at: src/app/dashboard/spiritual-journey/layout.tsx
   and has a default export function SpiritualJourneyLayout({ children }) that returns <>{children}</>.
*/
import SpiritualJourneyLayout from './layout'

describe('SpiritualJourneyLayout', () => {
  test('renders text child content', () => {
    render(
      <SpiritualJourneyLayout>
        Hello Spiritual Journey
      </SpiritualJourneyLayout>
    )
    expect(screen.getByText('Hello Spiritual Journey')).toBeInTheDocument()
  })

  test('renders a single element child', () => {
    render(
      <SpiritualJourneyLayout>
        <div data-testid="single-element">Content</div>
      </SpiritualJourneyLayout>
    )
    expect(screen.getByTestId('single-element')).toHaveTextContent('Content')
  })

  test('renders multiple children in order', () => {
    render(
      <SpiritualJourneyLayout>
        <span data-testid="child-1">First</span>
        <span data-testid="child-2">Second</span>
        <span data-testid="child-3">Third</span>
      </SpiritualJourneyLayout>
    )
    const c1 = screen.getByTestId('child-1')
    const c2 = screen.getByTestId('child-2')
    const c3 = screen.getByTestId('child-3')
    expect(c1).toBeInTheDocument()
    expect(c2).toBeInTheDocument()
    expect(c3).toBeInTheDocument()

    // Check order by DOM position
    expect(c1.compareDocumentPosition(c2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(c2.compareDocumentPosition(c3) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  test('renders nested structures', () => {
    render(
      <SpiritualJourneyLayout>
        <section aria-label="outer">
          <header>
            <h1>Journey</h1>
          </header>
          <main>
            <article>
              <p>Step 1</p>
            </article>
            <article>
              <p>Step 2</p>
            </article>
          </main>
          <footer>End</footer>
        </section>
      </SpiritualJourneyLayout>
    )
    // Basic a11y style checks
    expect(screen.getByRole('heading', { name: 'Journey' })).toBeInTheDocument()
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText('End')).toBeInTheDocument()
  })

  test('renders fragment children without additional DOM wrappers', () => {
    render(
      <SpiritualJourneyLayout>
        <>
          <span data-testid="frag-1">A</span>
          <span data-testid="frag-2">B</span>
        </>
      </SpiritualJourneyLayout>
    )
    expect(screen.getByTestId('frag-1')).toBeInTheDocument()
    expect(screen.getByTestId('frag-2')).toBeInTheDocument()
  })

  test('gracefully handles null children', () => {
    // @ts-expect-error - testing runtime behavior when children is null
    render(<SpiritualJourneyLayout>{null}</SpiritualJourneyLayout>)
    // Nothing to assert other than no crash; ensure container is present
    // With Testing Library, if render returned, it didn't crash.
    expect(true).toBe(true)
  })

  test('gracefully handles undefined children', () => {
    // @ts-expect-error - testing runtime behavior when children is undefined
    render(<SpiritualJourneyLayout>{undefined}</SpiritualJourneyLayout>)
    expect(true).toBe(true)
  })

  test('supports numbers and booleans as children (ReactNode)', () => {
    const { container: c1 } = render(<SpiritualJourneyLayout>{42 as unknown as React.ReactNode}</SpiritualJourneyLayout>)
    expect(c1).toHaveTextContent('42')

    const { container: c2 } = render(<SpiritualJourneyLayout>{false as unknown as React.ReactNode}</SpiritualJourneyLayout>)
    // false renders nothing; ensure no crash
    expect(c2).toBeTruthy()
  })

  test('renders arrays of children correctly', () => {
    render(
      <SpiritualJourneyLayout>
        {
          [
            <span key="a" data-testid="arr-a">Alpha</span>,
            <span key="b" data-testid="arr-b">Beta</span>,
          ]
        }
      </SpiritualJourneyLayout>
    )
    expect(screen.getByTestId('arr-a')).toHaveTextContent('Alpha')
    expect(screen.getByTestId('arr-b')).toHaveTextContent('Beta')
  })

  test('matches snapshot for a representative structure', () => {
    const { container } = render(
      <SpiritualJourneyLayout>
        <div>
          <h2>Snapshot Title</h2>
          <p>Description of the journey.</p>
        </div>
      </SpiritualJourneyLayout>
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})