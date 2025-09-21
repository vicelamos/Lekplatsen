// src/Login.js
import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function Login({ user }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
   // NYTT: Om användaren redan är inloggad, navigera till startsidan
  useEffect(() => {
    if (user) {
      navigate('/lekplatser');
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/'); // Skicka till startsidan efter registrering
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Skicka till startsidan efter inloggning
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Logga in eller skapa konto</h2>
      <form>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-post" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Lösenord" required />
        <button onClick={handleLogin}>Logga in</button>
        <button onClick={handleRegister}>Registrera</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default Login;