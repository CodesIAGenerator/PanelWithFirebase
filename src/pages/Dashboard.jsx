import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import Perfil from '../components/Perfil';
import Usuarios from '../components/Usuarios';
import Proyectos from '../components/Proyectos';
import Tareas from '../components/Tareas';
import '../Dashboard.css';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/firebase';
import { FloatButton } from 'antd';
import { BulbOutlined, LogoutOutlined } from '@ant-design/icons';
import Precios from '../components/Precios';

const { Header, Content, Footer, Sider } = Layout;

function Dashboard() {
  const [userPhoto, setUserPhoto] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('1');
  const [userRole, setUserRole] = useState(null);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [darkMode, setDarkMode] = useState(false);


  // Colores
  const menuStyle = darkMode ? { backgroundColor: '#000', color: '#fff' } : { backgroundColor: 'inherit', color: '#000' };
const menuItemStyle = darkMode ? { color: '#fff' } : { color: '#000' };
const selectedMenuItemStyle = darkMode ? { color: '#000', backgroundColor: '#aaa' } : { color: '#000', backgroundColor: '#e6e6e6' };





  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAvatarClick = () => {
    setShowProfile(true);
    setSelectedMenu('3');
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        const fetchUserData = async () => {
          const userRef = doc(firestore, 'users', user.uid);
          const docSnapshot = await getDoc(userRef);
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            setUserPhotoURL(data.photoURL || user.photoURL);
          }
        };
        fetchUserData();
  
        const userRef = doc(firestore, 'users', user.uid);
        const docSnapshot = await getDoc(userRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUserRole(userData.role);
        } else {
          await setDoc(userRef, {
            email: user.email,
            role: 'user'
          }, { merge: true });
          setUserRole('user');
        }
      }
    });
  
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      await auth.signOut();
      const userRef = doc(firestore, 'users', userId);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if ("twoFAEnabled" in data) {
          await updateDoc(userRef, { twoFAVerified: false });
        }
      }
    }
  };

  const renderContent = () => {
    if (showProfile) {
      return <Perfil />;
    }
    switch (selectedMenu) {
      case '2':
        return <Usuarios darkMode={darkMode} />;
      case '3':
        return <Perfil />;
      case '4':
        return <Proyectos setProyectoSeleccionado={setProyectoSeleccionado} />;
      case '5':
        return <Tareas proyectoSeleccionado={proyectoSeleccionado} />;
      case '6':
        return <Precios />  
      default:
        return <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
          Contenido principal del panel
        </div>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: darkMode ? '#121212' : '#f4f4f4' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ backgroundColor: darkMode ? '#000' : 'inherit' }}
      >
        <div className="logo" />
        <Menu 
          style={menuStyle}
          mode="inline"
          selectedKeys={[selectedMenu]}
          onSelect={({ key }) => {
            setSelectedMenu(key);
            setShowProfile(false);
          }}
        >
          <Menu.Item style={selectedMenu === '1' ? selectedMenuItemStyle : menuItemStyle} key="1">Inicio</Menu.Item>
          {userRole === 'admin' && <Menu.Item style={selectedMenu === '2' ? selectedMenuItemStyle : menuItemStyle} key="2">Usuarios</Menu.Item>}
          <Menu.Item style={selectedMenu === '3' ? selectedMenuItemStyle : menuItemStyle} key="3">Perfil</Menu.Item>
          <Menu.Item style={selectedMenu === '4' ? selectedMenuItemStyle : menuItemStyle} key="4">Proyectos</Menu.Item>
          <Menu.Item style={selectedMenu === '5' ? selectedMenuItemStyle : menuItemStyle} key="5">Tareas</Menu.Item>
          <Menu.Item style={selectedMenu === '6' ? selectedMenuItemStyle : menuItemStyle} key="6">Precios</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="site-layout-sub-header-background" style={{ background: darkMode ? '#1E1E1E' : '#fff', color: darkMode ? '#fff' : '#333' }}>
          <Avatar src={userPhotoURL} style={{ marginRight: '10px' }} onClick={handleAvatarClick} />
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>Cerrar sesión</Button>

        </Header>
        <Content style={{ margin: '0', background: darkMode ? '#121212' : '#fff', color: darkMode ? '#fff' : '#333' }}>
          {renderContent()}
        </Content>
        <Footer style={{ textAlign: 'center', background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#333' }}>Tu Empresa ©2023 Creado por Tu Nombre</Footer>
      </Layout>
      <FloatButton
        style={{ bottom: 20, right: 20 }}
        onClick={toggleDarkMode}
        icon={<BulbOutlined />}
      >
        {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
      </FloatButton>
    </Layout>
  );
  
}

export default Dashboard;
