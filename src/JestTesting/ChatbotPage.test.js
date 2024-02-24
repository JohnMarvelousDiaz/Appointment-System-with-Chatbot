import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ChatbotComponent from '../Chatbot/ChatbotPage';

beforeEach(() => {
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
});

// Restore the original console.error and console.warn after each test
afterEach(() => {
  global.console.error.mockRestore();
  global.console.warn.mockRestore();
});

jest.mock('../', () => {
  return {
    firebase: {
      auth: () => ({ currentUser: { uid: 'mockUserId' } }),
      firestore: {
        collection: () => ({
          add: () => Promise.resolve(),
        }),
        runTransaction: async () => {},
      },
    },
  };
});

describe('ChatbotComponent', () => {
  it('renders correctly', () => {
    render(<ChatbotComponent />);
  });

  
  it('handles button click and gets response', () => {
    render(<ChatbotComponent />);
    const Button = screen.getByTestId('handle-button');
    fireEvent.click(Button);
  });

});
