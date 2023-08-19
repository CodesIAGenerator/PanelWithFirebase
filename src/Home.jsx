import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, signInWithPopup } from './firebase';
import Typist from 'react-typist';
import './Home.css';
import { Button } from 'antd';

function Home() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="container">
      <div className="googleButtonContainer">
        {isAuthenticated ? (
          <button className="dashboardButton" onClick={() => navigate('/dashboard')}>
            Ir a Dashboard
          </button>
        ) : (
          <button className="googleLoginButton" onClick={handleGoogleLogin}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" />
            Iniciar sesion con Google
          </button>
        )}
      </div>
      <div className="separator"></div>
      <div className="gradientContainer">
        <Typist cursor={{ show: true, blink: true }}>
          Bienvenido a nuestra plataforma. ¡Conéctate y descubre todas las funcionalidades que tenemos para ti!
        </Typist>
      </div>
    </div>
  );
}

export default Home;
