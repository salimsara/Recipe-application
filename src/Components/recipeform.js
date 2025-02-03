import React, { useState } from 'react';
import { useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from './navbar';
import { AuthContext } from './AuthContext';
import '../App.css';

const RecipeForm = () => {
    const { currentUser, login, logout } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [picture, setPicture] = useState(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            console.log(e.message);
        }
    }

    const ImageOnChange = (e) => {
        const file = e.target.files[0];
        setPicture(file);
    };

    const IngredientsOnChange = (e) => {
        const ingredientsArray = e.target.value.split(',');
        setIngredients(ingredientsArray);
    };

    const KeywordsOnChange = (e) => {
        const keywordsArray = e.target.value.split(',');
        setKeywords(keywordsArray);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userId = currentUser.uid;

            const storageRef = ref(storage, `images/${picture.name}`);
            await uploadBytes(storageRef, picture);
            const imageUrl = await getDownloadURL(storageRef);

            const recipeData = {
                name: name,
                ingredients: ingredients,
                instructions: instructions,
                keywords: keywords,
                images: imageUrl,
                uid: userId
            };

            const response = await fetch('http://localhost:5001/api/uusiResepti', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(recipeData)
            });

            if (!response.ok) {
                throw new Error('Reseptin lisäys epäonnistui');
            }
            setIngredients([]);
            setInstructions('');
            setName('');
            setKeywords([]);
            setPicture(null);

            console.log('Reseptin lisäys onnistui');
            alert('Reseptin lisäys onnistui');
            navigate("/myrecipe");
        } catch (error) {
            console.error('Reseptin lisäys epäonnistui:', error.message);
            alert('Reseptin lisäys epäonnistui');
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
                            <button onClick={() => navigate('/myrecipe')} className="button">Omat reseptit</button>
                            <button onClick={() => navigate('/favorites')} className="button">Omat suosikit</button>
                            <button onClick={handleLogout} className="button">Kirjaudu ulos</button>
                        </nav>
                    </>
                ) : (
                    <button onClick={() => navigate('/login')} className="button">Kirjaudu sisään</button>
                )}
            </nav>
            <h2 style={{fontFamily: "'Courier New', Courier, monospace", marginLeft: '20px', marginBottom: '30px'}}>Uusi resepti</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="input-field">
                    <label className="label">
                        Reseptin nimi:
                    </label>
                    <input
                        type="text"
                        placeholder='Syötä reseptin nimi'
                        style={{ fontFamily: "'Courier New', Courier, monospace" }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <div className="input-field">
                    <label className="label">
                        Ainesosat:
                    </label>
                    <input
                        type="text"
                        placeholder='Esim. 1 dl sokeria, 2 kanamunaa, jne '
                        style={{ fontFamily: "'Courier New', Courier, monospace" }}
                        value={ingredients.join(',')}
                        onChange={IngredientsOnChange}
                        required
                        className="input"
                    />
                </div>
                <div className="input-field">
                    <label className="label">
                        Reseptin ohjeet:
                    </label>
                    <textarea
                        placeholder='Syötä ohje'
                        style={{ fontFamily: "'Courier New', Courier, monospace" }}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        required
                        className="input"
                    />
                </div>
                <div className="input-field">
                    <label className="label">
                        Avainsanat:
                        <input
                            type="text"
                            placeholder='Syötä avainsanat pilkuilla erotettuna'
                            style={{ fontFamily: "'Courier New', Courier, monospace" }}
                            value={keywords.join(',')}
                            onChange={KeywordsOnChange}
                            required
                            className="input"
                        />
                    </label>
                </div>
                <div className="input-field">
                    <label className="label">
                        Kuvat:
                        <input
                            type="file"
                            accept="image/*"
                            style={{ fontFamily: "'Courier New', Courier, monospace" }}
                            onChange={ImageOnChange}
                            required
                            className="input"
                        />
                    </label>
                </div>
                <button type="submit" className="button">Lisää resepti</button>
            </form>
        </div>
    );
};

export default RecipeForm;