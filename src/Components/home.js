import React, { useState, useEffect, useContext } from "react";
import Navbar from './navbar';
import { CardGroup, Card } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { AuthContext } from './AuthContext';
import '../App.css';

const Home = () => {
  const { currentUser, login, logout } = useContext(AuthContext);
  const userEmail = currentUser ? currentUser.email : null;
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/reseptit`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const recipeData = await response.json();
        const recipesWithCreator = await Promise.all(recipeData.map(async (recipe) => {
          const creator = await fetch(`http://localhost:5001/api/kayttajaprofiili/${recipe.uid}`);

          if (!creator.ok) {
            throw new Error('Failed to fetch creator');
          }
          const creatorData = await creator.json();
          const creatorName = creatorData[0].name;

          return { ...recipe, creatorName };
        }));

        const nonHiddenRecipes = recipesWithCreator.filter(recipe => !recipe.hidden);
        setRecipes(nonHiddenRecipes);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/haesuosikit?uid=${currentUser.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch favorite recipes');
        }
        const data = await response.json();
        const favoriteIds = data.map(favorite => favorite.rid);
        setFavorites(favoriteIds);
      } catch (error) {
        console.error('Error fetching favorite recipes:', error);
      }
    };

    if (currentUser) {
      fetchFavorites();
    }
  }, [currentUser]);

  const addFavoriteRecipe = async (id, name) => {
    try {
      const response = await fetch('http://localhost:5001/api/suosikki', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: currentUser.uid,
          rid: id
        }),
      });

      if (!response.ok) {
        alert("Suosikki listaan lisääminen epäonnistui");
        throw new Error('Failed to add favorite recipe');
      } else {
        setFavorites([...favorites, id]);
        alert(`Resepti "${name}" on lisätty suosikkeihin`);
      }

    } catch (error) {
      console.error('Error adding favorite recipe:', error);
    }
  };

  function recipeSelected(item) {
    navigate(`/recipe/${item.id}`, {
      state: {
        id: item.id,
        name: item.name,
        creatorName: item.creatorName,
        images: item.images,
        ingredients: item.ingredients,
        instructions: item.instructions,
        keywords: item.keywords
      }
    });
  }

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '10px' }}>
        <Navbar />
        <input type="text" placeholder="Hae resepti..."
          style={{ width: '40%', height: '35px', borderRadius: '10px', border: '1px solid #ccc', paddingLeft: '10px', fontFamily: "'Courier New', Courier, monospace" }}
          onChange={(e) => setSearch(e.target.value)} />
        {currentUser && login ? (
          <>
            <nav>
              <button onClick={() => navigate('/profile')} className="button">Oma profiili</button>
              {userEmail === 'admin@gmail.com' && <button onClick={() => navigate('/users')} className="button">Käyttäjähallinta</button>}
              {login && userEmail === 'admin@gmail.com' ? (
                <button onClick={() => navigate('/recipemanagement')} className="button">Reseptien hallinta</button>
              ) : (
                <>
                  <button onClick={() => navigate('/myrecipe')} className="button">Omat reseptit</button>
                  <button onClick={() => navigate('/favorites')} className="button">Omat suosikit</button>
                </>
              )}
              <button onClick={handleLogout} className="button">Kirjaudu ulos</button>
            </nav>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="button">Kirjaudu sisään</button>
        )}
      </nav>
      <CardGroup style={{ display: "flex", flexWrap: 'wrap', padding: '20px', justifyContent: 'flex-start', marginTop: '3vh' }}>
        {recipes.filter((item) => {
          return item.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase())) ||
            item.name.toLowerCase().includes(search.toLowerCase())
        })
          .map((item, index) => (
            <Card key={index} style={{ flex: '1 0 20vw', flexGrow: '1', maxWidth: '30vw' }}>
              <Card.Img className="recipe-image-link" variant="top" src={item.images} style={{ width: '70%', height: '60%', objectFit: 'cover' }}
                onClick={() => recipeSelected(item)} />
              <Card.Body style={{ marginTop: '5px' }}>
                <Card.Title style={{ marginLeft: '10px', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold' }}>{item.name}</Card.Title>
                <Card.Text style={{ marginLeft: '10px', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold', width: '70%' }}>
                  {item.keywords.join(',').split(',').map(keyword => `#${keyword.trim().toLowerCase()}`).join(' ')}
                </Card.Text>
                {currentUser && login && !favorites.includes(item.id) && (
                  <button onClick={() => addFavoriteRecipe(item.id, item.name)} className="button">Lisää suosikkeihin</button>
                )}
              </Card.Body>
            </Card>
          ))}
      </CardGroup>
    </div>
  );
};

export default Home;