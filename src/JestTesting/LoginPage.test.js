import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import LoginPage from '../LoginPage/LoginPage';

beforeEach(() => {
    global.console.error = jest.fn();
    global.console.warn = jest.fn();
  });
  
  // Restore the original console.error and console.warn after each test
  afterEach(() => {
    global.console.error.mockRestore();
    global.console.warn.mockRestore();
  });

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    sendEmailVerification: jest.fn(),
}));

const { signInWithEmailAndPassword } = require('firebase/auth');

const submitLoginForm = (email, password) => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('E-mail');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Log In');

    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.click(loginButton);
};

test('renders login page', () => {
    render(<LoginPage />);
    expect(screen.getByText('Log In to your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
});

test('handles login form submission', async () => {
    const signInWithEmailAndPassword = require('firebase/auth').signInWithEmailAndPassword;
    signInWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: true } });

    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText('E-mail');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByText('Log In');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'test@example.com', 'password123');

});

test('navigates to registration page', () => {
    render(<LoginPage />);
    const createAccountButton = screen.getByText('Create an account');
    fireEvent.click(createAccountButton);
});

test('handles incorrect email', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/user-not-found' });

    submitLoginForm('test@example.com', 'wrongpassword');

    expect(await screen.findByText('User not found')).toBeInTheDocument();
});

test('handles incorrect password', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-login-credentials' });

    submitLoginForm('test@example.com', "wrongpassword");

    expect(await screen.findByText('Wrong Log In Credentials')).toBeInTheDocument();
})

test('handles empty login fields', async () => {
    submitLoginForm('', '');

    expect(await screen.findByText('E-mail and Password must be completed')).toBeInTheDocument();
});

test('handles too many incorrect attempts', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/too-many-requests' });

    submitLoginForm('test@example.com', 'wrongpassword');

    expect(await screen.findByText('Too many failed attempts, please try again later')).toBeInTheDocument();
});

test('handles existing account but disabled', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/user-disabled' });

    submitLoginForm('test@example.com', 'wrongpassword');

    expect(await screen.findByText('Account Disabled')).toBeInTheDocument();
});