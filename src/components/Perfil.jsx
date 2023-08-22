import React, { useState, useEffect } from 'react';
import { DownloadOutlined, CopyTwoTone, UploadOutlined } from '@ant-design/icons';
import { Card, Form, Input, Button, message, Switch, Avatar, Modal, Upload } from 'antd';
import { auth, firestore } from '../firebase/firebase';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [token, setToken] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [url, setUrl] = useState('');
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [imageGoogle, setImageGoogle] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setImageGoogle(user.photoURL);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (file) => {
    if (file) {
      const storage = getStorage();
      const storageRef = ref(storage, 'profile-images/' + auth.currentUser.uid);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);


      // Actualizar la URL de la imagen en Firestore
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: url });
      message.success('Imagen de perfil actualizada con éxito!');
    }

    setEditProfileModalVisible(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setUserData(userData);
        setTwoFAEnabled(userData.twoFAEnabled || false);
        setSecret(userData.secret || null);
        setBackupCodes(userData.backupCodes || []);
      }      
    };
  
    fetchUserData();
  }, []);

  useEffect(() => {
    console.log(auth.currentUser.displayName);
  }, [twoFAEnabled]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditProfileImageClick = () => {
    setEditProfileModalVisible(true);
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

  const generateBackupCodes = (n = 5) => {
    const codes = [];
    for (let i = 0; i < n; i++) {
      codes.push(Math.floor(10000000 + Math.random() * 90000000).toString());
    }
    return codes;
  };

  const handle2FAToggle = async (checked) => {
    if (checked) {
      const newSecret = authenticator.generateSecret();
      setSecret(newSecret);

      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { secret: newSecret });

      setIsModalVisible(true);
      console.log(newSecret);
    } else {
      setSecret(null);
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { twoFAEnabled: deleteField(), twoFAVerified: deleteField(), secret: deleteField(), backupCodes: deleteField() });
      message.success('Verificación de dos pasos desactivada.');
      setTwoFAEnabled(false);
    }
  };

  const handleCopyToClipboard = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    message.success('Códigos copiados al portapapeles!');
  };

  const handleDownload = () => {
    const text = backupCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOk = async () => {
    const isValid = authenticator.verify({ token: token, secret: secret });

    if (isValid) {
      message.success('Verificación exitosa!');
      setIsModalVisible(false);
      setTwoFAEnabled(true);

      const codes = generateBackupCodes();
      setBackupCodes(codes);
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { twoFAEnabled: true, secret: secret, backupCodes: codes, twoFAVerified: true });

      setBackupModalVisible(true); // Mostrar modal de códigos de respaldo
    } else {
      message.error('El código de verificación es incorrecto. Inténtalo de nuevo.');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const getImageFromFireStorage = async() => {
    const userRef = doc(firestore, 'users', auth.currentUser.uid);
    const docSnapshot = await getDoc(userRef);

    setUrl(docSnapshot.data().photoURL);
  }

  getImageFromFireStorage();

  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>Subir</div>
    </div>
  );

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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar size={60} src={url || imageGoogle} />             
              <Button type='dashed' onClick={handleEditProfileImageClick} style={{ marginTop: 10}}>              
                Editar foto
              </Button>
            </div>
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
        {backupCodes.length > 0 && (
          <Modal
            title="Tus códigos de respaldo"
            visible={backupModalVisible}
            onOk={() => setBackupModalVisible(false)}
            onCancel={() => setBackupModalVisible(false)}
          >
            <pre>{backupCodes.join('\n')}</pre>
            <DownloadOutlined onClick={handleDownload} style={{ marginRight: '10px' }} />
            <CopyTwoTone onClick={handleCopyToClipboard} />
          </Modal>
        )}
        <Modal
          title="Editar foto de perfil"
          visible={editProfileModalVisible}
          onCancel={() => setEditProfileModalVisible(false)}
          footer={null}
        >
          <Upload
            showUploadList={false}
            customRequest={({ file }) => handleImageUpload(file)}
          >
            {url ? <img src={url} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
          </Upload>
        </Modal>
      </Card>
    </div>
  );
}

export default Perfil;
