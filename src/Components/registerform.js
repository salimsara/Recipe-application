import React, { useState, useContext } from 'react';
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export function RegisterForm() {
    const { logout } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            const userData = {
                email: email,
                name: name,
                uid: user.uid,
                username: username
            };

            const response = await fetch('http://localhost:5001/api/rekisterointi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                alert('Rekisteröityminen epäonnistui.');
                throw new Error('Rekisteröityminen epäonnistui.');
            }
            logout();
            alert('Rekisteröityminen onnistui');
            navigate('/login');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
            alert('Sähköpostiosoite on jo rekisteröity.');
        } else {
            console.error('Error:', error);
            alert('Rekisteröityminen epäonnistui.');
        }
        }
        setEmail('');
        setName('');
        setUsername('');
        setPassword('');
    };

    return (
        <div>
            <Navbar />
            <div className="login-container">
                <h2 style={{ fontFamily: "'Courier New', Courier, monospace" }}>Rekisteröidy käyttäjäksi</h2>
                <form data-testid="register-form" onSubmit={handleRegister} style={{ padding: '3vh' }}>
                    <div className="input-field">
                        <label style={{fontWeight: 'bold'}}>Sähköposti:</label>
                        <input id='email' data-testid="email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '18vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" required />
                    </div>
                    <div className="input-field">
                        <label style={{fontWeight: 'bold'}}>Nimi:</label>
                        <input id='name' data-testid="name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '18vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" required />
                    </div>
                    <div className="input-field">
                        <label style={{fontWeight: 'bold'}}>Käyttäjänimi:</label>
                        <input id='username' data-testid="username-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '18vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" required />
                    </div>
                    <div className="input-field">
                        <label style={{fontWeight: 'bold'}}>Salasana:</label>
                        <input id='password' data-testid="password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '18vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" required />
                    </div>
                    <button type="submit" className='button'>Rekisteröidy</button>
                </form>
                <button onClick={() => navigate('/login')} className='button'>Löytyykö tili? Kirjaudu sisään tästä</button>
            </div>
        </div>
    );
}

export default RegisterForm;