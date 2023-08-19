import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import { auth, signOut } from './firebase';
import './Dashboard.css';

const { Header, Content, Footer, Sider } = Layout;

function Dashboard() {
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserPhoto(user.photoURL);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="logo" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">Opción 1</Menu.Item>
          <Menu.Item key="2">Opción 2</Menu.Item>
          <Menu.Item key="3">Opción 3</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="site-layout-sub-header-background">
          {userPhoto && <Avatar src={userPhoto} style={{ marginRight: '10px' }} />}
          <Button type="primary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            Contenido principal del panel
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Tu Empresa ©2023 Creado por Tu Nombre</Footer>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
