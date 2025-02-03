import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { AuthContext } from './AuthContext';
import { CardGroup, Card } from 'react-bootstrap';

function MyRecipe() {
  const { currentUser, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userRecipes, setUserRecipes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState({
    name: "",
    ingredients: [],
    instructions: "",
    keywords: []
  });

  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (currentUser) {
        try {
          const response = await fetch(`http://localhost:5001/api/userReseptit/${currentUser.uid}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user recipes');
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
          setUserRecipes(recipesWithCreator);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchUserRecipes();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.log(e.message);
    }
  }

  const handleEditRecipe = (recipe) => {
    setEditedRecipe(recipe);
  }

  const handleDeleteRecipe = async (id) => {
    const vahvistus = window.confirm(`Haluatko varmasti poistaa reseptin?`);
    if (vahvistus) {
      try {
        await fetch(`http://localhost:5001/api/poistaResepti/${id}`, {
          method: 'DELETE',
        });
        setUserRecipes(userRecipes.filter(recipe => recipe.id !== id));

        alert("Reseptin poisto onnistui");
      } catch (error) {
        console.error('Error deleting recipe: ', error);
        alert("Reseptin poisto epäonnistui");
      }
    }
  };

  const handleHideRecipe = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/piilota/${id}`, {
        method: 'PUT',
      });
      setUserRecipes(userRecipes.map(recipe => {
        if (recipe.id === id) {
          return { ...recipe, hidden: true };
        }
        return recipe;
      }));
      alert("Reseptin piilottaminen onnistui");
    } catch (error) {
      console.error('Error hiding recipe: ', error);
      alert("Reseptin piilottaminen epäonnistui");
    }
  };

  const handleUnhideRecipe = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/eipiilossa/${id}`, {
        method: 'PUT',
      });
      setUserRecipes(userRecipes.map(recipe => {
        if (recipe.id === id) {
          return { ...recipe, hidden: false };
        }
        return recipe;
      }));
      alert("Reseptin näkyviin tuominen onnistui");
    } catch (error) {
      console.error('Error unhiding recipe: ', error);
      alert("Reseptin näkyviin tuominen epäonnistui");
    }
  };

  const handleUpdateRecipe = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/reseptinmuokkaus/${editing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editedRecipe.name,
          ingredients: editedRecipe.ingredients,
          instructions: editedRecipe.instructions,
          keywords: editedRecipe.keywords
        })
      });
      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }

      setUserRecipes(userRecipes.map(recipe => {
        if (recipe.id === editing.id) {
          return {
            ...recipe,
            name: editedRecipe.name,
            images: editedRecipe.images,
            ingredients: editedRecipe.ingredients,
            instructions: editedRecipe.instructions,
            keywords: editedRecipe.keywords
          };
        }
        return recipe;
      }));

      setEditing(false);
      alert("Reseptin päivitys onnistui");
    } catch (error) {
      console.error('Error updating recipe: ', error);
      alert("Reseptin päivitys epäonnistui");
    }
  };

  const handleInputChange = (e) => {
    if (e.target.name === "ingredients" || e.target.name === "keywords") {
      setEditedRecipe({
        ...editedRecipe,
        [e.target.name]: e.target.value.split(e.target.name === "ingredients" ? ', ' : ' #')
      });
    } else {
      setEditedRecipe({ ...editedRecipe, [e.target.name]: e.target.value });
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
        {currentUser && login ? (
          <>
            <nav>
              <button onClick={() => navigate('/profile')} className="button">Oma profiili</button>
              <button onClick={() => navigate('/favorites')} className="button">Omat suosikit</button>
              <button onClick={handleLogout} className="button">Kirjaudu ulos</button>
            </nav>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="button">Kirjaudu sisään</button>
        )}
      </nav>
      <h2 style={{ fontFamily: "'Courier New', Courier, monospace", textAlign: 'center' }}>Omat reseptit</h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={() => navigate('/recipeform')} className='button'>Lisää uusi resepti</button>
      </div>
      {userRecipes.length > 0 ? (
        <CardGroup style={{ display: "flex", flexWrap: 'wrap', padding: '10px', justifyContent: 'flex-start', marginTop: '3vh' }}>
          {userRecipes.map((item, index) => (
            <Card key={index} style={{ flex: '1 0 20vw', flexGrow: '1', padding: '5px', maxWidth: '30vw' }}>
              {!editing || (editing && editing.id !== item.id) ? (
                <>
                  <Card.Img className='recipe-image-link' variant="top" src={item.images} style={{ marginLeft: '15px', width: '70%', height: '50%', objectFit: 'cover' }}
                    onClick={() => recipeSelected(item)} />
                  <Card.Body style={{ marginTop: '5px' }}>
                    <Card.Title style={{ marginLeft: '20px', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold' }}>{item.name}</Card.Title>
                    <Card.Text style={{ marginLeft: '20px', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold', width: '70%' }}>
                      {item.keywords.join(',').split(',').map(keyword => `#${keyword.trim().toLowerCase()}`).join(' ')}
                    </Card.Text>
                    <button className="button" onClick={() => { handleEditRecipe(item); setEditing(item); }}>Muokkaa</button>
                    {item.hidden ? (
                      <button className="button" onClick={() => handleUnhideRecipe(item.id)}>Näytä resepti</button>
                    ) : (
                      <button className="button" onClick={() => handleHideRecipe(item.id)}>Piilota resepti</button>
                    )}
                    <button className="button" onClick={() => handleDeleteRecipe(item.id)}>Poista resepti</button>
                  </Card.Body>
                </>
              ) : (
                <>
                  <div style={{
                    display: 'flex', justifyContent: 'center', flexDirection: 'column', fontFamily: "'Courier New', Courier, monospace",
                    border: "3px solid rgb(0, 0, 0)", borderRadius: "10px"
                  }}>
                    <h5 style={{ marginLeft: '10px' }}>Muokkaa reseptiä {item.name}</h5>
                    <div style={{ marginLeft: "10px" }}>
                      <label>Reseptin nimi:</label>
                      <input className='recipeinput' required type="text" name="name" value={editedRecipe.name} onChange={handleInputChange} style={{ width: '20vw', fontFamily: "'Courier New', Courier, monospace", borderRadius: "5px" }} />
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <label >Ainesosat:</label>
                      <input className='recipeinput' required type="text" name="ingredients" value={editedRecipe.ingredients} onChange={handleInputChange} style={{ width: '20vw', fontFamily: "'Courier New', Courier, monospace", borderRadius: "5px" }} />
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <label>Valmistuskuvaus:</label>
                      <textarea required type="text" name="instructions" value={editedRecipe.instructions} onChange={handleInputChange} style={{
                        width: '25vw', fontFamily: "'Courier New', Courier, monospace", borderRadius: "5px",
                        fontSize: "15px", border: "2px solid rgb(31, 31, 31)"
                      }} />
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <label>Avainsanat:</label>
                      <input className='recipeinput' required type="text" name="keywords" value={editedRecipe.keywords} onChange={handleInputChange} style={{ width: '20vw', fontFamily: "'Courier New', Courier, monospace", borderRadius: "5px" }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button onClick={handleUpdateRecipe} className="button">Tallenna</button>
                      <button onClick={() => setEditing(false)} className="button">Peruuta</button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </CardGroup>
      ) : (
        <p style={{ fontFamily: "'Courier New', Courier, monospace", textAlign: 'center', marginTop: '100px' }}>Sinulla ei ole omia reseptejä. Luo uusi yllä olevasta napista!</p>
      )}
    </div>
  );
}

export default MyRecipe;