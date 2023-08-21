import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user || localStorage.getItem('twoFACompleted') !== 'true') {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Verificar si el usuario ha completado la verificación de dos pasos
  if (localStorage.getItem('twoFACompleted') !== 'true') {
    return <div>Por favor, completa la verificación de dos pasos para acceder al dashboard.</div>;
  }

  return children;
}

export default ProtectedRoute;
