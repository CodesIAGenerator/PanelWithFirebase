import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, signInWithPopup, firestore } from './firebase';
import { collection, setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { authenticator } from 'otplib';
import { Button, Modal, Input, message } from 'antd';
import Typist from 'react-typist';
import './Home.css';
import { useAuth } from './auth-context';

function Home() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [secret, setSecret] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [userId, setUserId] = useState(null);
  const { isTwoFACompleted, completeTwoFA, resetTwoFA } = useAuth();
  const [isButtonDashbordDisabled, setIsButtonDashbordDisabled] = useState(false);

useEffect(() => {
    if (isAuthenticated && !isTwoFACompleted) {
      setIsModalVisible(true);
    }
}, [isAuthenticated, isTwoFACompleted]);


useEffect(() => {
  setIsButtonDisabled(!userToken); // El botón estará desactivado si userToken está vacío
}, [userToken]);



const getUserSecret = async (userId) => {
    try {
        const userRef = doc(firestore, 'users', userId);
        const docSnapshot = await getDoc(userRef);
        if (docSnapshot.exists()) {
            console.log("Secret del usuario:", docSnapshot.data().secret);
            setSecret(docSnapshot.data().secret); // Almacenar en 'secret'
            
            // Comprobar el valor de twoFAVerified
            if (docSnapshot.data().twoFAVerified) {
                completeTwoFA();
                setIsModalVisible(false);
            }
        } else {
            console.log("No se encontró el documento del usuario.");
        }
    } catch (error) {
        console.error("Error al obtener el secreto del usuario:", error);
    }
}


useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    setIsAuthenticated(!!user);
    if (user) {
      setUserId(user.uid);
      if (!isTwoFACompleted) {
        getUserSecret(user.uid);
      }
    }
  });

  return () => unsubscribe();
}, [isTwoFACompleted]);


const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const userRef = doc(firestore, 'users', result.user.uid);
  
        // Asegúrate de que el secreto se establezca aquí si es la primera vez que el usuario inicia sesión
        await setDoc(
          userRef,
          {
            email: result.user.email,
            role: 'user',
            // secret: 'TU_SECRETO_GENERADO'  // Descomenta y establece el secreto aquí si es necesario
          },
          { merge: true }
        );
  
        setUserId(result.user.uid);
        // Llama a getUserSecret después de crear/actualizar el documento del usuario
        getUserSecret(result.user.uid);
      }
    } catch (error) {
      console.error('Error al iniciar sesión o crear el usuario:', error);
    }
};



const enableButtonDashboard = async (userId) => {
  const userRef = doc(firestore, 'users', userId);
  const docSnapshop = await getDoc(userRef);

  if (docSnapshop.data().twoFAVerified) {
    setIsButtonDashbordDisabled(false);
  } else {
    setIsButtonDashbordDisabled(true);
    message.info('Debes pasar la verificación de dos pasos ');
  }
}


const handleVerifyToken = async () => {
  if (!secret) {
    message.error('El secreto de verificación no está configurado.');
    return;
  }

  setIsButtonDisabled(true);

  const isValid = authenticator.verify({ token: userToken, secret: secret });

  if (isValid) {
    message.success('Verificación exitosa!');
    setIsModalVisible(false); // Cierra el modal
    completeTwoFA(); // Marcar la verificación de dos pasos como completada
    localStorage.setItem('twoFACompleted', 'true');
    
    // Actualizar twoFAVerified en Firestore
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { twoFAVerified: true });

    navigate('/dashboard');
} else {
  message.error("Error al introducir el codigo de dos pasos.");
}


  setIsButtonDisabled(false);
};



useEffect(() => {
  if (userId) {
    enableButtonDashboard(userId);
  }
}, [userId])

return (
    <div className="container">
      <div className="googleButtonContainer">
        {isAuthenticated ? (
          <button
          className="dashboardButton"
          disabled={isButtonDashbordDisabled}
          onClick={() => navigate('/dashboard')}
      >
          Ir a Dashboard
      </button>
      
        ) : (
          <button className="googleLoginButton" onClick={handleGoogleLogin}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google Logo"
            />
            Iniciar sesión con Google
          </button>
        )}
      </div>
      <div className="separator"></div>
      <div className="gradientContainer">
        <Typist cursor={{ show: true, blink: true }}>
          Bienvenido a nuestra plataforma. ¡Conéctate y descubre todas las funcionalidades que tenemos para ti!
        </Typist>
      </div>
      <Modal
        title="Verificación de dos pasos"
        visible={isModalVisible}
        closable={false}
        footer={[
          <Button key="verify" type="primary" onClick={handleVerifyToken} disabled={isButtonDisabled}>
            Verificar
          </Button>,
        ]}
      >
        <p>Ingresa el código de verificación de dos pasos:</p>
        <Input
          value={userToken}
          onChange={(e) => setUserToken(e.target.value)}
          placeholder="Ingresa el código"
        />
      </Modal>
    </div>
  );
}

export default Home;