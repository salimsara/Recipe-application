import { useContext } from "react";
import Navbar from './navbar';
import { useState } from "react";
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      await login(email, password)
      navigate('/profile')
    }
    catch (e) {
      if (e.code === "auth/invalid-credential") {
        alert('Sähköposti tai salasana on väärin!');
      } else {
        alert('Kirjautuminen epäonnistui.');
      }
      console.log(e.message);
      setEmail('');
      setPassword('');
    }
  }

  return (
    <div>
      <Navbar />
      <div className="login-container">
        <h2 style={{ fontFamily: "'Courier New', Courier, monospace" }}>Kirjaudu sisään</h2>
        <form onSubmit={handleLogin} style={{ padding: '3vh' }}>
          <div className="input-field">
            <label style={{ fontWeight: 'bold' }}>Sähköposti:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Syötä sähköposti"
            style={{ width: '18vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" />
          </div>
          <div className="input-field">
            <label style={{ fontWeight: 'bold' }}>Salasana:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Syötä salasana"
             style={{ width: '18vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" />
          </div>
          <button type="submit" className="button">Kirjaudu</button>
        </form>
        <button onClick={() => navigate('/forgot')} className="button">Unohdin salasanani</button>
        <button onClick={() => navigate('/register')} className="button">Ei tiliä? Rekisteröidy tästä</button>
      </div>
    </div>
  );
};

export default Login;