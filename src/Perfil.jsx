import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Upload, Avatar } from 'antd';
import { auth, firestore, storage } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';


function Perfil() {
  const [userData, setUserData] = useState({});
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      const docSnapshot = await getDoc(userRef);
      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data());
        setUserPhotoURL(docSnapshot.data().photoURL || null);
      }
    };

    fetchUserData();
  }, []);

  

  const handleUpload = async (file) => {
    console.log(file.file)
    const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}/${Date.now()}-${file.file.name}`);
    try {
      await uploadBytes(storageRef, file.file); // Aquí también cambiamos file por file.file
      const downloadURL = await getDownloadURL(storageRef);
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: downloadURL });
      setUserPhotoURL(downloadURL);
      message.success('Imagen actualizada con éxito!');
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      message.error('Error al subir imagen.');
    }
    return false; // Esto es para evitar que el componente Upload envíe el archivo automáticamente después de seleccionarlo
  };
  
  
  
  

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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card title="Perfil de Usuario" style={{ width: 400 }}>
        <Avatar src={userPhotoURL} size={64} style={{ display: 'block', margin: '0 auto 20px auto' }} />
        <Upload
          showUploadList={false}
          customRequest={handleUpload}
          beforeUpload={(file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
              message.error('Solo puedes subir archivos JPG/PNG!');
            }
            return isJpgOrPng;
          }}
        >
          <Button style={{ display: 'block', margin: '0 auto 20px auto' }}>Cambiar foto de perfil</Button>
        </Upload>
        {isEditing ? (
          <Form initialValues={userData} onFinish={handleSave}>
            <Form.Item label="Nombre" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Guardar
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <>
            <p><strong>Nombre:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <Button onClick={handleEdit}>Editar</Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default Perfil;
