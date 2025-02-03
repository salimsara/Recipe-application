import './App.css';
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './Components/AuthContext';
import UserProfile from './Components/profile';
import Home from './Components/home';
import Login from './Components/login';
import Forgot from './Components/forgotform';
import { RegisterForm } from "./Components/registerform";
import Recipe from './Components/recipe';
import MyRecipes from './Components/myrecipes';
import RecipeForm from './Components/recipeform';
import UserManagementPage from './Components/usermanagement';
import RecipeManagementPage from './Components/recipemanagement';
import Favorites from './Components/favorites';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/myrecipe" element={<MyRecipes />} />
          <Route path="/recipeform" element={<RecipeForm />} />
          <Route path="/recipe/:id" element={<Recipe />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/recipemanagement" element={<RecipeManagementPage />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
