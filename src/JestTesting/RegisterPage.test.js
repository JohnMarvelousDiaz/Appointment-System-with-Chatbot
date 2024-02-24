import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../LoginPage/RegisterPage';

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
    auth: {
        onAuthStateChanged: jest.fn(),
    },
    createUserWithEmailAndPassword: jest.fn(),
    updateProfile: jest.fn(),
    sendEmailVerification: jest.fn(),
}));

const createUserWithEmailAndPassword = require('firebase/auth').createUserWithEmailAndPassword;


test('renders registration form', () => {
    render(<RegisterPage />);
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('E-mail');
    const passwordInput = screen.getByPlaceholderText('Password');
    const registerButton = screen.getByText('Register');

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
});

test('navigates to login page', () => {
    render(<RegisterPage />);
    const loginButton = screen.getByText('Log In Here');
    fireEvent.click(loginButton);
});

test('handles registration form submission', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: { emailVerified: true } });

    render(<RegisterPage />);
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('E-mail');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
    const registerButton = screen.getByText('Register');

    fireEvent.change(nameInput, { target: { value: 'test' } });
    fireEvent.change(emailInput, { target: { value: 'test@bulsu.edu.ph' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } }); // Adding Confirm Password input
    fireEvent.click(registerButton);

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'test@bulsu.edu.ph', 'password123');
});

test('handles empty registration fields', async () => {
    const submitLoginForm = (name, email, password, passwordConfirmation) => {
        render(<RegisterPage />);
        const nameInput = screen.getByPlaceholderText('Name');
        const emailInput = screen.getByPlaceholderText('E-mail');
        const passwordInput = screen.getByPlaceholderText('Password');
        const passwordConfirmationInput = screen.getByPlaceholderText('Confirm Password');
        const registerButton = screen.getByText('Register');
        
        fireEvent.change(nameInput, { target: { value: name } });
        fireEvent.change(emailInput, { target: { value: email } });
        fireEvent.change(passwordInput, { target: { value: password } });
        fireEvent.change(passwordConfirmationInput, { target: { value: passwordConfirmation } });
        fireEvent.click(registerButton);
    };

    submitLoginForm('', '', '', '');

    expect(await screen.findByText('E-mail, Password, Display Name, and Password Confirmation must be completed')).toBeInTheDocument();
});

test('validates registration with admin display name', () => {
    render(<RegisterPage />);
    const nameInput = screen.getByPlaceholderText('Name');
    const registerButton = screen.getByText('Register');

    fireEvent.change(nameInput, { target: { value: 'admin' } });
    fireEvent.click(registerButton);

    expect(screen.getByText("Display Name 'admin' is not allowed.")).toBeInTheDocument();
});

test('validates email already in use', async () => {
    render(<RegisterPage />);
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('E-mail');
    const passwordInput = screen.getByPlaceholderText('Password');
    const passwordConfirmationInput = screen.getByPlaceholderText('Confirm Password');
    const registerButton = screen.getByText('Register');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'test@bulsu.edu.ph' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(passwordConfirmationInput, { target: { value: 'password123' } });

    createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' });

    fireEvent.click(registerButton);

    await waitFor(() => {
        expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
});
