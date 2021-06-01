import { render } from '@testing-library/react';
import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';

test('renders navigation', async () => {
    const { findByText, findByDisplayValue} = render(
        <Router hashType="noslash">
            <App />
        </Router>
    );

    expect(await findByText(/wallet/i, {selector: 'a'})).toBeInTheDocument();
    expect(await findByText(/about/i, {selector: 'a'})).toBeInTheDocument();
    expect(await findByText(/Log in/i, {selector: 'a'})).toBeInTheDocument();
    expect(await findByText(/solid accountant/i, {selector: 'a'})).toBeInTheDocument();
    
    // })
});
