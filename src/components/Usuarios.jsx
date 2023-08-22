import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase/firebase';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { List, Button, Card, Avatar, Modal, Typography, Form, Input, Switch } from 'antd';

const { Title } = Typography;

function Usuarios() {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nameGoogle, setNameGoogle] = useState(null);



  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(firestore, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setNameGoogle(user.displayName);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteUser = async (userId) => {
    Modal.confirm({
      title: '¿Estás seguro de que deseas borrar este usuario?',
      content: 'Esta acción no se puede deshacer.',
      onOk: async () => {
        await deleteDoc(doc(firestore, 'users', userId));
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      }
    });
  };

 
  const handleCardClick = async (userId) => {
    const userRef = doc(firestore, 'users', userId);
    const docSnapshot = await getDoc(userRef);
    const userData = docSnapshot.data();
    setSelectedUser({ id: userId, ...userData });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
    const userRef = doc(firestore, 'users', selectedUser.id);
  
    // Preparar los valores para actualizar en Firestore
    const updateValues = { ...values };
    if (!values.twoFAEnabled) {
      updateValues.twoFAEnabled = false;
      updateValues.twoFAVerified = null;
      updateValues.secret = null;
    }
  
    // Verificar que todos los campos estén definidos
    Object.keys(updateValues).forEach(key => {
      if (updateValues[key] === undefined) {
        delete updateValues[key]; // Eliminar cualquier campo que sea undefined
      }
    });
  
    // Actualizar los valores en Firestore
    await setDoc(userRef, updateValues, { merge: true });
  
    setIsModalVisible(false);
    setUsers(prevUsers => prevUsers.map(user => (user.id === selectedUser.id ? { ...user, ...updateValues } : user)));
  };
  
  

  return (
    <div>
      <Title level={2}>Lista de Usuarios</Title>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={users}
        renderItem={user => (
          <List.Item>
            <Card hoverable
              onClick={() => handleCardClick(user.id)}
              actions={[
                <Button type="danger" onClick={() => handleDeleteUser(user.id)}>
                  Borrar
                </Button>
              ]}
            >
              <Card.Meta
                avatar={user.photoURL ? <Avatar src={user.photoURL} /> : null}
                title={<strong>{user.name || nameGoogle}</strong>}
                description={`Rol: ${user.role}\n${user.email}`}
              />
            </Card>
          </List.Item>
        )}
      />
      {selectedUser && (
        <Modal
          title="Editar Usuario"
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form
            onFinish={handleSave}
            initialValues={{
              ...selectedUser,
              twoFAEnabled: selectedUser.twoFAEnabled || false, // Utiliza el valor de twoFAEnabled como valor inicial
            }}
          >
            <Form.Item name="name" label="Nombre">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
            <Form.Item name="photoURL" label="URL de la foto">
              <Input />
            </Form.Item>
            <Form.Item name="twoFAEnabled" label="Verificación de dos pasos" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Guardar</Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
  
  
}

export default Usuarios;
