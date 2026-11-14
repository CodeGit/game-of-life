import { MantineProvider } from '@mantine/core';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

// Renders a component inside the MantineProvider that every Mantine component needs.
// env="test" turns off transitions, so dialogs and menus open and close at once.
export function renderWithMantine(ui: ReactElement) {
  return render(<MantineProvider env="test">{ui}</MantineProvider>);
}
