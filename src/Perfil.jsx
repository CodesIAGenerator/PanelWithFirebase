import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Switch, Avatar, Modal } from 'antd';
import { auth, firestore } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { authenticator } from 'otplib';
import QRCode from 'qrcode.react';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

function Perfil() {
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [secret, setSecret] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setUserData(userData);
        setTwoFAEnabled(userData.twoFAEnabled || false); // Actualizar el estado basado en los datos
        setSecret(userData.secret || null);
      }
    };
  
    fetchUserData();
  }, []);
  

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (values) => {
    try {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userRef, values);
      setUserData(values);
      setIsEditing(false);
      message.success('Datos actualizados con éxito!');
    } catch (error) {
      message.error('Hubo un error al actualizar los datos.');
    }
  };

  const handle2FAToggle = async (checked) => {
    if (checked) {
      const newSecret = authenticator.generateSecret();
      console.log(newSecret);
      setSecret(newSecret);
      setIsModalVisible(true);
      // Actualizar el estado y la base de datos
      setTwoFAEnabled(true);
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { twoFAEnabled: true, secret: newSecret });
    } else {
      setSecret(null);
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { twoFAEnabled: false, secret: null });
      message.success('Verificación de dos pasos desactivada.');
      setTwoFAEnabled(false);
    }
  };

  const handleOk = () => {
    const isValid = authenticator.verify({ token: token, secret: secret });

    if (isValid) {
      message.success('Verificación exitosa!');
      setIsModalVisible(false);
      setTwoFAEnabled(true);
    } else {
      message.error('El código de verificación es incorrecto. Inténtalo de nuevo.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Perfil de Usuario" style={{ width: 400 }}>
        {isEditing ? (
          <Form onFinish={handleSave} initialValues={userData}>
            <Form.Item name="name" label="Nombre">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Guardar</Button>
            </Form.Item>
          </Form>
        ) : (
          <>
            <p><strong>Nombre:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <Button onClick={handleEdit}>Editar</Button>
          </>
        )}
        <br />
        <br />
        <p>Verificación de dos pasos:</p>
        <Switch checked={twoFAEnabled} onChange={handle2FAToggle} />
        {secret && (
          <Modal
            title="Verificación de dos pasos"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <QRCode value={authenticator.keyuri('TuApp', 'TuApp', secret)} />
            <p>Escanea el código QR con tu aplicación de autenticación y luego ingresa el código generado a continuación:</p>
            <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Ingresa el código" />
          </Modal>
        )}
      </Card>
    </div>
  );
}

export default Perfil;
