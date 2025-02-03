import React, { useState, useEffect, useContext } from 'react';
import Navbar from './navbar';
import { useNavigate } from "react-router-dom";
import { AuthContext } from './AuthContext';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const { currentUser, login, logout } = useContext(AuthContext);
  const userEmail = currentUser ? currentUser.email : null;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/kayttajat');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    getUsers();
  }, []);

  const handleDeleteUser = async (id, email, username) => {
    if (email === 'admin@gmail.com') {
      alert('Adminia ei voi poistaa');
      return;
    }
    const vahvistus = window.confirm(`Haluatko varmasti poistaa käyttäjän "${username}"? Myös käyttäjällä luodut reseptit poistetaan.`);
    if (vahvistus) {
      try {
        await fetch(`http://localhost:5001/api/kayttajahallinta/${id}`, {
          method: 'DELETE',
        });
        setUsers(users.filter(user => user.id !== id));
        alert(`Käyttäjä ${username} on poistettu`);
      } catch (error) {
        console.error('Error deleting user: ', error);
        alert("Käyttäjän poisto epäonnistui");
      }
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
              {userEmail === 'admin@gmail.com' && <button onClick={() => navigate('/recipemanagement')} className="button">Reseptien hallinta</button>}
              <button onClick={handleLogout} className="button">Kirjaudu ulos</button>
            </nav>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="button">Kirjaudu sisään</button>
        )}
      </nav>
      <div className="user-table" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
        <h2>Käyttäjähallinta</h2>
        <table>
          <thead>
            <tr>
              <th>Sähköposti</th>
              <th>Nimi</th>
              <th>Käyttäjänimi</th>
              <th>Toiminnot</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.id, user.email, user.username)} className='button'>Poista</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
