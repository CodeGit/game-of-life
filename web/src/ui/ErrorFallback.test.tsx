import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from 'react-error-boundary';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithMantine } from '@/test-utils';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  it('shows what went wrong, as an alert', () => {
    renderWithMantine(
      <ErrorFallback error={new Error('the grid broke')} resetErrorBoundary={vi.fn()} />,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByText('the grid broke')).toBeInTheDocument();
  });

  it('shows something that was thrown but is not an Error', () => {
    renderWithMantine(<ErrorFallback error="just a string" resetErrorBoundary={vi.fn()} />);
    expect(screen.getByText('just a string')).toBeInTheDocument();
  });

  it('asks the boundary to reset when Try again is clicked', async () => {
    const resetErrorBoundary = vi.fn();
    renderWithMantine(
      <ErrorFallback error={new Error('oops')} resetErrorBoundary={resetErrorBoundary} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
  });
});

describe('ErrorFallback inside an ErrorBoundary', () => {
  // React logs every error a boundary catches, which would bury the test output.
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderBroken(shouldThrow: { current: boolean }) {
    function Child() {
      if (shouldThrow.current) throw new Error('boom');
      return <p>All fine</p>;
    }
    renderWithMantine(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Child />
      </ErrorBoundary>,
    );
  }

  it('replaces a component that throws while rendering', () => {
    renderBroken({ current: true });
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(screen.queryByText('All fine')).not.toBeInTheDocument();
  });

  it('shows the component again after Try again, once the cause is fixed', async () => {
    const shouldThrow = { current: true };
    renderBroken(shouldThrow);
    shouldThrow.current = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('All fine')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps showing the error if Try again does not fix it', async () => {
    renderBroken({ current: true });
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
