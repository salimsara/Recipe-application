import React, { useState, useContext, useEffect } from 'react';
import Navbar from './navbar';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const { currentUser, logout, login } = useContext(AuthContext);
    const userEmail = currentUser ? currentUser.email : null;
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        name: '',
        username: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const response = await fetch(`http://localhost:5001/api/kayttajaprofiili/${currentUser.uid}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data');
                    }
                    const userData = await response.json();
                    setUser(userData[0]);
                    setEditedUser(userData[0]);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
        }
        fetchUserData();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            console.log(e.message);
        }
    }

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/kayttajamuokkaus/${currentUser.uid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: editedUser.username,
                    name: editedUser.name
                })
            });
            if (!response.ok) {
                alert("Tietojen muokkaus epäonnistui");
                throw new Error('Failed to update user data');
            }
            alert("Käyttäjätiedot on muokattu")
            setUser(editedUser);
            setEditing(false);
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const handleInputChange = (e) => {
        setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '10px' }}>
                <Navbar />
                <nav>
                    {userEmail === 'admin@gmail.com' && <button onClick={() => navigate('/users')} className="button">Käyttäjähallinta</button>}
                    {login && userEmail === 'admin@gmail.com' ? (
                        <button onClick={() => navigate('/recipemanagement')} className="button">Reseptien hallinta</button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/myrecipe')} className="button">Omat reseptit</button>
                            <button onClick={() => navigate('/favorites')} className="button">Omat suosikit</button>
                        </>
                    )}
                </nav>
            </nav>
            <h2 style={{ fontFamily: "'Courier New', Courier, monospace", textAlign: 'center' }}>Oma profiili</h2>
            {user ? (
                <div>
                    <div className="profile-container">
                        {editing ? (
                            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', fontFamily: "'Courier New', Courier, monospace" }}>
                                <div className="profile-field">
                                    <label style={{ fontWeight: 'bold' }} className="profile-label">Nimi:</label>
                                    <input required type="text" name="name" value={editedUser.name} onChange={handleInputChange} style={{ width: '20vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" />
                                </div>
                                <div className="profile-field">
                                    <label style={{ fontWeight: 'bold' }} className="profile-label">Käyttäjänimi:</label>
                                    <input required type="text" name="username" value={editedUser.username} onChange={handleInputChange} style={{ width: '20vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" />
                                </div>
                                <div className="profile-field">
                                    <label style={{ fontWeight: 'bold' }} className="profile-label">Sähköposti:</label>
                                    <p className="profile-input">{user.email}</p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button onClick={handleSaveClick} className="button">Tallenna</button>
                                    <button onClick={() => setEditing(false)} className="button">Peruuta</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                                <div className="profile-field">
                                    <label style={{ fontWeight: 'bold' }} className="profile-label">Nimi:</label>
                                    <p className="profile-input">{user.name}</p>
                                </div>
                                <div className="profile-field">
                                    <label style={{ fontWeight: 'bold' }} className="profile-label">Käyttäjänimi:</label>
                                    <p className="profile-input">{user.username}</p>
                                </div>
                                <div className="profile-field">
                                    <label style={{ fontWeight: 'bold' }} className="profile-label">Sähköposti:</label>
                                    <p className="profile-input">{user.email}</p>
                                </div>
                                <button style={{ marginLeft: '10px' }} onClick={() => setEditing(true)} className="button">Muokkaa tietoja</button>
                                <button onClick={handleLogout} className="button">Kirjaudu ulos</button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p style={{ fontFamily: "'Courier New', Courier, monospace", textAlign: 'center', marginTop: "50px"}}>Loading...</p>
            )}
        </div>
    );
};

export default UserProfile;
