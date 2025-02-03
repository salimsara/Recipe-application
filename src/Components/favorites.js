import { CardGroup, Card } from 'react-bootstrap';
import Navbar from './navbar';
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from './AuthContext';
import '../App.css';

export function Favorites() {
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const { currentUser, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            console.log(e.message);
        }
    }

    useEffect(() => {
        const fetchFavoriteRecipes = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/haesuosikit?uid=${currentUser.uid}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch favorite recipes');
                }
                const data = await response.json();
                setFavoriteRecipes(data);
            } catch (error) {
                console.error('Error fetching favorite recipes:', error);
            }
        };
        fetchFavoriteRecipes();
    }, [currentUser]);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/reseptit');
                if (!response.ok) {
                    throw new Error('Failed to fetch recipes');
                }
                const data = await response.json();
                setRecipes(data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        };

        fetchRecipes();
    }, []);

    const deleteFavoriteRecipe = async (fid, name) => {
        try {
            const response = await fetch(`http://localhost:5001/api/poistasuosikki/${fid}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Suosikki reseptin poisto epäonnistui');
            }
            setFavoriteRecipes(favoriteRecipes.filter(favorite => favorite.fid !== fid));
            alert(`Resepti "${name}" on poistettu suosikeista.`);
        } catch (error) {
            console.error('Error deleting favorite recipe:', error);
        }
    }

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

    const usersFavoriteRecipes = recipes.map(recipe => {
        const favorite = favoriteRecipes.find(favorite => favorite.rid === recipe.id && favorite.uid === currentUser.uid);
        return {
            ...recipe,
            fid: favorite ? favorite.fid : null
        };
    }).filter(recipe => recipe.fid !== null);

    return (
        <div>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '10px' }}>
                <Navbar />
                {currentUser && login ? (
                    <>
                        <nav>
                            <button onClick={() => navigate('/profile')} className="button">Oma profiili</button>
                            <button onClick={() => navigate('/myrecipe')} className="button">Omat reseptit</button>
                            <button onClick={handleLogout} className="button">Kirjaudu ulos</button>
                        </nav>
                    </>
                ) : (
                    <button onClick={() => navigate('/login')} className="button">Kirjaudu sisään</button>
                )}
            </nav>
            <h2 style={{ fontFamily: "'Courier New', Courier, monospace", textAlign: 'center' }}>Suosikkilista</h2>
            {usersFavoriteRecipes.length > 0 ? (
                <div>
                    <CardGroup style={{ display: "flex", flexWrap: 'wrap', padding: '20px', justifyContent: 'flex-start', marginTop: '3vh' }}>
                        {usersFavoriteRecipes.map((item, index) => (
                            <Card key={index} style={{ flex: '1 0 20vw', flexGrow: '1', maxWidth: '30vw' }}>
                                <Card.Img className="recipe-image-link" variant="top" src={item.images} style={{ width: '70%', height: '50%', objectFit: 'cover' }} onClick={() => recipeSelected(item)} />
                                <Card.Body style={{ marginTop: '5px' }}>
                                    <Card.Title style={{ marginLeft: '10px', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold' }}>{item.name}</Card.Title>
                                    <Card.Text style={{ marginLeft: '10px', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold' }}>
                                        {item.keywords.join(',').split(',').map(keyword => `#${keyword.trim().toLowerCase()}`).join(' ')}
                                    </Card.Text>
                                    <button className="button" onClick={() => deleteFavoriteRecipe(item.fid, item.name)}>Poista suosikeista</button>
                                </Card.Body>
                            </Card>
                        ))}
                    </CardGroup>
                </div>
            ) : (
                <p style={{ fontFamily: "'Courier New', Courier, monospace", textAlign: 'center', marginTop: '100px' }}>Sinulla ei ole vielä suosikkeja</p>
            )}
        </div >
    );
};

export default Favorites;