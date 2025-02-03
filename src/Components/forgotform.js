import React, { useState } from "react";
import Navbar from './navbar';
import { UserAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export function Forgot() {
  const [email, setEmail] = useState("");
  const { forgotPassword } = UserAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/api/salasananpalautus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        alert('Sähköpostin lähettäminen epäonnistui. Sähköpostiosoitetta ei ole rekisteröity.')
        throw new Error("Sähköpostiosoitetta ei ole rekisteröity.");
      }
      await forgotPassword(email);
      alert("Salasanan palautuslinkki lähetetty.")
    } catch (error) {
      console.error('Error:', error);
    }
    setEmail("");
  };

  return (
    <div>
      <Navbar />
      <div className="login-container">
        <h2 style={{ fontFamily: "'Courier New', Courier, monospace" }}>Unohditko salasanasi?</h2>
        <p style={{ fontFamily: "'Courier New', Courier, monospace", marginBottom: '30px' }}>Syötä rekisteröimäsi sähköpostiosoite alla olevaan kenttään</p>
        <form onSubmit={handleSubmit} style={{ padding: '3vh' }}>
          <div className="input-field">
            <label style={{fontWeight: 'bold'}}>Sähköposti:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '15vw', fontFamily: "'Courier New', Courier, monospace" }} className="input" required />
          </div>
          <button type="submit" className='button' >Palauta salasana</button>
        </form>
        <button onClick={() => navigate('/login')} className='button'>Takaisin kirjautumissivulle</button>
      </div>
    </div>
  );
}

export default Forgot;