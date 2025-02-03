import React, { useState, useContext, useEffect } from "react";
import Navbar from './navbar';
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { AuthContext } from './AuthContext';

const Recipe = () => {
  const { currentUser, login, logout } = useContext(AuthContext);
  const userEmail = currentUser ? currentUser.email : null;
  const { state } = useLocation();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [username, setUsername] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/')
  };

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

  const fetchUserProfile = async () => {
    if (currentUser) {
      try {
        const response = await fetch(`http://localhost:5001/api/kayttajaprofiili/${currentUser.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        setUsername(userData[0]?.username);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/arvostelut?rid=${state.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data.reverse());
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchUserProfile();
  });

  const addReview = async () => {
    if (newReview.trim() !== '' && state && state.id) {
      if (!currentUser || username === '') {
        alert('Kirjaudu sisään kirjoittaaksesi arvostelun!');
        setNewReview('');
        return;
      }
      try {
        const response = await fetch('http://localhost:5001/api/uusiarvostelu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uid: currentUser.uid,
            rid: state.id,
            review: newReview,
            username: username
          })
        });
        if (!response.ok) {
          throw new Error('Failed to add review');
        }

        setNewReview('');
        setTimeout(fetchReviews, 300);
      } catch (error) {
        console.error('Error adding review:', error);

      }
    }
  };

  const handleShareByEmail = () => {
    if (state && state.name && state.images) {
      const recipeURL = window.location.href;
      const subject = `Tsekkaa tämä resepti: ${state.name}`;
      const body = `Moi,\n\nlöysin herkullisen reseptin nimeltä "${state.name}" ja halusin jakaa sen kanssasi! Löydät sen tästä linkistä: ${recipeURL}`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      window.open(mailtoLink);
    } else {
      console.error('Error: Recipe data is missing.');
    }
  };

  return (
    <div>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '10px' }}>
        <Navbar />
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
      {state && state.name && state.images && (
        <div style={{ display: 'flex' }}>
          <img className="recipe-image" src={state.images} alt="" style={{ marginLeft: 10, width: '40%', height: 'auto' }} />
          <div style={{ marginLeft: 20, fontFamily: "'Courier New', Courier, monospace" }}>
            <h1 >{state.name}</h1>
            <h4>Tekijä: {state.creatorName}</h4>
            <h2>Avainsanat</h2>
            <p>{state.keywords.join(',').split(',').map(keyword => `#${keyword.trim().toLowerCase()}`).join(' ')}</p>
            <h2>Ainesosat</h2>
            <p>{state.ingredients.join(', ')}</p>
            <h2>Valmistuskuvaus</h2>
            <p>{state.instructions}</p>
            <button onClick={handleShareByEmail} className="button">Jaa resepti sähköpostilla</button>
            {currentUser && login && !favorites.includes(state.id) && (
              <button onClick={() => addFavoriteRecipe(state.id, state.name)} className="button">Lisää suosikkeihin</button>
            )}
          </div>
        </div>
      )}
      <div style={{ marginTop: '20px', marginLeft: '20px', fontFamily: "'Courier New', Courier, monospace" }}>
        <h2>Arvostelut</h2>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <strong>{review.username}</strong>: {review.review}
            </div>
          ))
        ) : (
          <p>Ei arvosteluja vielä.</p>
        )}
        <div style={{ marginTop: '10px' }}>
          <textarea
            rows="3"
            cols="50"
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Kirjoita arvostelu"
            style={{
              fontSize: '15px', fontFamily: "'Courier New', Courier, monospace",
              border: "2px solid rgb(30, 30, 30)",
              borderRadius: "10px"
            }}
          />
          <br />
          <button onClick={addReview} className="button" style={{ marginTop: '10px' }}>
            Lisää arvostelu
          </button>
        </div>
      </div>
    </div>
  );
};
export default Recipe;