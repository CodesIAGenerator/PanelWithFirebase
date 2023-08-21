import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, signInWithPopup, firestore } from './firebase';
import { setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
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
  const [backupCodes, setBackupCodes] = useState([]);

  useEffect(() => {
    setIsButtonDisabled(!userToken);
  }, [userToken]);

  const getUserSecret = async (userId) => {
    try {
      const userRef = doc(firestore, 'users', userId);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        setSecret(docSnapshot.data().secret);
      } else {
        console.log("No se encontró el documento del usuario.");
      }
    } catch (error) {
      console.error("Error al obtener el secreto del usuario:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        setUserId(user.uid);
        await getUserSecret(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        const userRef = doc(firestore, 'users', userId);
        const docSnapshot = await getDoc(userRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (!("twoFAVerified" in data) || data.twoFAVerified === true) {
            setIsModalVisible(false);
          } else if (data.twoFAVerified === false) {
            setIsModalVisible(true);
          }
        }
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchBackupCodes = async () => {
      if (userId) {
        const userRef = doc(firestore, 'users', userId);
        const docSnapshot = await getDoc(userRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setBackupCodes(data.backupCodes || []);
        }
      }
    };

    fetchBackupCodes();
  }, [userId]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const userRef = doc(firestore, 'users', result.user.uid);
        await setDoc(
          userRef,
          {
            email: result.user.email,
            role: 'user',
          },
          { merge: true }
        );
        setUserId(result.user.uid);
        await getUserSecret(result.user.uid);
      }
    } catch (error) {
      console.error('Error al iniciar sesión o crear el usuario:', error);
    }
  };

  const handleVerifyToken = async () => {
    if (!secret) {
      message.error('El secreto de verificación no está configurado.');
      return;
    }

    setIsButtonDisabled(true);
    const isValid = authenticator.verify({ token: userToken, secret: secret });

    if (isValid || backupCodes.includes(userToken)) {
      message.success('Verificación exitosa!');
      setIsModalVisible(false);
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, { twoFAVerified: true });
      if (backupCodes.includes(userToken)) {
        const updatedBackupCodes = backupCodes.filter(code => code !== userToken);
        await updateDoc(userRef, { backupCodes: updatedBackupCodes });
      }
      navigate('/dashboard');
    } else {
      message.error("Error al introducir el código de dos pasos.");
    }

    setIsButtonDisabled(false);
  };

  return (
    <div className="container">
      <div className="googleButtonContainer">
        {isAuthenticated ? (
          <button
            className="dashboardButton"
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
