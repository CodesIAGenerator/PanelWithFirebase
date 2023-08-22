import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("UserID establecido:", user.uid); // Verifica si se establece el userId
        setUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/');
      } else if (localStorage.getItem('twoFACompleted') !== 'true') {
        navigate('/dashboard'); // Redirige a la página de verificación de dos pasos
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const checkField = async (userId) => {
      try {
        const userRef = doc(firestore, 'users', userId);
        const docSnapshop = await getDoc(userRef);

        console.log(docSnapshop.exists());

        if (docSnapshop.exists()) {
          const data = docSnapshop.data();
          if (!("twoFAEnabled" in data)) {
            navigate('/dashboard');
            return;
          }

          if (!docSnapshop.data().twoFAVerified) {
            navigate('/');
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (userId) {
      checkField(userId);
    }

  }, [userId, navigate]);

  return children;
}

export default ProtectedRoute;
