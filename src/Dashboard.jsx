import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import { auth, signOut, firestore } from './firebase'; // Asegúrate de importar firestore
import Perfil from './Perfil';
import './Dashboard.css';
import Usuarios from './Usuarios';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { MenuItem } from '@mui/material';
const { Header, Content, Footer, Sider } = Layout;


function Dashboard() {
  const [userPhoto, setUserPhoto] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('1');
  const [userRole, setUserRole] = useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isTwoFACompleted, setIsTwoFACompleted] = useState(localStorage.getItem('twoFACompleted') === 'true');


  const handleAvatarClick = () => {
    setShowProfile(true);
    setSelectedMenu('3');
};

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async user => {
    if (user) {
      setUserPhoto(user.photoURL);
      const userRef = doc(firestore, 'users', user.uid);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setUserRole(userData.role);
      } else {
        await setDoc(userRef, {
          email: user.email,
          role: 'user'
        }, {merge: true});
        setUserRole('user');
      }
      const fetchUserData = async () => {
          const userRef = doc(firestore, 'users', auth.currentUser.uid);
          const docSnapshot = await getDoc(userRef);
          if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              setUserPhotoURL(data.photoURL || null);
          }
      };
      fetchUserData();
    }
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    const fetchUserData = async () => {
        if (auth.currentUser) {
            const userRef = doc(firestore, 'users', auth.currentUser.uid);
            const docSnapshot = await getDoc(userRef);
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                setUserPhotoURL(data.photoURL || null);
            }
        }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            setUserPhoto(user.photoURL);
            fetchUserData();
        }
    });

    return () => unsubscribe();
}, []);


const handleLogout = async () => {
  const userId = auth.currentUser?.uid;
  if (userId) {
    await auth.signOut();
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, { twoFAVerified: false });
    localStorage.setItem('twoFACompleted', 'false');
  }
};


  const renderContent = () => {
    if (showProfile) {
        return <Perfil />;
    }
    switch (selectedMenu) {
        case '2':
            return <Usuarios />;
        case '3':
            return <Perfil />;    
        default:
            return <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                Contenido principal del panel
            </div>;
    }
};


  console.log(userRole);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="logo" />
        <Menu theme="dark" mode="inline" selectedKeys={[selectedMenu]} onSelect={({ key }) => {
          setSelectedMenu(key);
          setShowProfile(false);
        }}>
          <Menu.Item key="1">Inicio</Menu.Item>
          {userRole === 'admin' && <Menu.Item key="2">Usuarios</Menu.Item>}
          <Menu.Item key="3">Perfil</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="site-layout-sub-header-background">
        <Avatar src={userPhotoURL || userPhoto} style={{ marginRight: '10px' }} onClick={handleAvatarClick} />
          <Button type="primary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          {renderContent()}
        </Content>
        <Footer style={{ textAlign: 'center' }}>Tu Empresa ©2023 Creado por Tu Nombre</Footer>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
