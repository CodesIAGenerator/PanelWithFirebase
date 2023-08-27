import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase/firebase';
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { List, Button, Card, Avatar, Modal, Typography, Form, Input, Switch, Select } from 'antd';

const { Title } = Typography;
const { Option } = Select;

function Usuarios({ darkMode }) {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [nameGoogle, setNameGoogle] = useState(null);

  const darkModeStyles = {
    backgroundColor: darkMode ? '#121212' : '#f4f4f4',
    color: darkMode ? '#E0E0E0' : '#333'
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(firestore, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    };

    fetchUsers();
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
    await setDoc(userRef, values, { merge: true });
    setIsModalVisible(false);
    setUsers(prevUsers => prevUsers.map(user => (user.id === selectedUser.id ? { ...user, ...values } : user)));
  };

  return (
    <div style={{ ...darkModeStyles, padding: '20px' }}>
      <Title style={darkModeStyles} level={2}>Lista de Usuarios</Title>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={users}
        renderItem={user => (
          <List.Item>
            <Card hoverable
              onClick={() => handleCardClick(user.id)}
              actions={[
                <Button style={{border: 'none', padding: '0 12px'}} onClick={(e) => {e.stopPropagation(); handleCardClick(user.id);}}>
                  Editar
                </Button>,
                <Button 
                type="danger" 
                onClick={(e) => {e.stopPropagation(); handleDeleteUser(user.id);}}
                style={{padding: '0 12px'}}
                >
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
            initialValues={selectedUser}
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
            <Form.Item name="role" label="Rol">
              <Select>
                <Option value="Admin">Admin</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Developer">Developer</Option>
                <Option value="Client">Client</Option>
              </Select>
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
