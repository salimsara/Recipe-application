import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  getIdToken
} from 'firebase/auth';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const CreateUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
  }
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return <div style={{fontFamily: "'Courier New', Courier, monospace"}}>Loading...</div>;
  }
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    return signOut(auth)
  }

  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const getAuthToken = async () => {
    if (currentUser) {
      try {
        const token = await getIdToken(auth.currentUser);
        return token;
      } catch (error) {
        console.error("Error getting ID token:", error);
        return null;
      }
    } else {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ CreateUser, currentUser, login, logout, forgotPassword, getAuthToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext)
}
export { AuthProvider, AuthContext };
