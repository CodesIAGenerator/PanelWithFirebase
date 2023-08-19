import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuth from './useAuth';
import { auth } from './firebase'; // Añade esta línea

function ProtectedRoute() {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user && !loading) {
        navigate('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, navigate, loading]);

  if (loading) {
    return null; // O puedes mostrar un spinner o algún componente de carga.
  }

  return <Outlet />;
}

export default ProtectedRoute;
