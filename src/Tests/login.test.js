import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContext } from '../Components/AuthContext';
import Login from '../Components/login';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('Login component', () => {
    test('Login form submission', async () => {
      const mockLogin = jest.fn();
  
      const { getByText, getByPlaceholderText, queryByText } = render(
        <AuthContext.Provider value={{ login: mockLogin }}>
          <Router>
            <Login />
          </Router>
        </AuthContext.Provider>
      );
  
      await waitFor(() => {
        expect(queryByText('Loading...')).toBeNull();
      });
  
      // Syötetään sähköposti ja salasana
      const emailInput = getByPlaceholderText('Syötä sähköposti');
      const passwordInput = getByPlaceholderText('Syötä salasana');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
  
      // Painetaan Kirjaudu -nappi
      const submitButton = getByText('Kirjaudu');
      fireEvent.click(submitButton);
  
      // Tarkistetaan, että login on kutsuttu
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1);
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });