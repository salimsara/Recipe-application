import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Components/home';
import { AuthContext } from '../Components/AuthContext';

const mockAuthContextValue = {
  currentUser: { email: 'test@example.com' },
  login: jest.fn(),
  logout: jest.fn()
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('Home component', () => {
  test('Reseptit näytetään etusivulla ja haku toimii', () => {
    const recipes = [
      { id: 1, name: 'Pasta Carbonara', keywords: ['pasta', 'italian'], images: 'pasta.jpg', ingredients: ['pasta', 'eggs', 'bacon'], instructions: 'Cook pasta, fry bacon, mix with eggs', creatorName: 'Chef1' },
      { id: 2, name: 'Chicken Curry', keywords: ['chicken', 'curry', 'spicy'], images: 'curry.jpg', ingredients: ['chicken', 'curry paste', 'coconut milk'], instructions: 'Cook chicken, add curry paste and coconut milk', creatorName: 'Chef2' },
      { id: 3, name: 'Salmon Teriyaki', keywords: ['salmon', 'teriyaki', 'japanese'], images: 'salmon.jpg', ingredients: ['salmon', 'soy sauce', 'mirin'], instructions: 'Marinate salmon, grill until cooked', creatorName: 'Chef3' }
    ];

    const { getByText, getByPlaceholderText, queryByText } = render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContextValue}>
          <Home />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Tarkistetaan, että reseptit näytetään etusivulla
    recipes.forEach(recipe => {
      waitFor(() => expect(queryByText(recipe.name)).toBeInTheDocument());
      waitFor(() => expect(getByText(`#${recipe.keywords.join(' #')}`)).toBeInTheDocument());
    });

    // Syötetään reseptin nimi
    const searchInput = getByPlaceholderText('Hae resepti...');
    fireEvent.change(searchInput, { target: { value: 'pasta' } });

    waitFor(() => {
      // Tarkistetaan, että haku toimii ja vain 'Pasta Carbonara' näytetään käyttäjälle
      expect(queryByText('Pasta Carbonara')).toBeInTheDocument();
      expect(queryByText('Chicken Curry')).toBeNull();
      expect(queryByText('Salmon Teriyaki')).toBeNull();
    });
  });
});