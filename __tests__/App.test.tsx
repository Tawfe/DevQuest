import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';

import App from '../src/App';

test('renders the sign-in screen when no session is stored', async () => {
  render(<App />);

  // Auth restore resolves to signed-out (keychain mock is empty), so the
  // Roblox sign-in entry point must be on screen.
  await waitFor(() => {
    expect(screen.getByText('Continue with Roblox')).toBeOnTheScreen();
  });
});
