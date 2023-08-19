import React, { useState, useEffect } from 'react';
import { firestore } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { List, Button, Card, Avatar, Modal, Typography } from 'antd';

const { Title } = Typography;

function Usuarios() {
  const [users, setUsers] = useState([]);

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

  return (
    <div>
      <Title level={2}>Lista de Usuarios</Title>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={users}
        renderItem={user => (
          <List.Item>
            <Card
              actions={[
                <Button type="danger" onClick={() => handleDeleteUser(user.id)}>
                  Borrar
                </Button>
              ]}
            >
              <Card.Meta
                avatar={<Avatar src={user.photoURL} />}
                title={user.email}
                description={`Rol: ${user.role}`}
              />
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default Usuarios;
