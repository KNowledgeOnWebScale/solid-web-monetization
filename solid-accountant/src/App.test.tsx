import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation', () => {
    const { container } = render(<App />);
    const home = container.querySelector('a[href*="#"]');
    const wallet = container.querySelector('a[href*="#wallet" i]');
    const about = container.querySelector('a[href*="#about" i]');
    const auth = container.querySelector('a[href*="#auth" i]');
    expect(home).toBeInTheDocument();
    expect(wallet).toBeInTheDocument();
    expect(about).toBeInTheDocument();
    expect(auth).toBeInTheDocument();
});
