import React, { useState, useEffect } from 'react';
import { Button, Input, List, message, Modal, Select } from 'antd';
import { auth, firestore } from '../firebase/firebase';
import { doc, updateDoc, getDoc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import emailjs from 'emailjs-com';

const { Option } = Select;

function Proyectos({ setProyectoSeleccionado, proyectoSeleccionado }) {
  const [proyecto, setProyecto] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [emailInvitado, setEmailInvitado] = useState('');
  const [proyectoSeleccionadoInvitacion, setProyectoSeleccionadoInvitacion] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tarea, setTarea] = useState('');
  const [fechaLimite, setFechaLimite] = useState(null);
  const [tareas, setTareas] = useState([]);
  const serviceId = 'service_2qso07q';
  const templateId = 'template_o9rmwno';
  const userId = 'WGRhPjqH4vQhBtY53';

  const usuarioId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchProyectos = async () => {
      if (usuarioId) {
        const userRef = doc(firestore, 'users', usuarioId);
        const docSnapshot = await getDoc(userRef);
        if (docSnapshot.exists() && Array.isArray(docSnapshot.data().proyectos)) {
          console.log(docSnapshot.data().proyectos); // Agrega esta línea
          setProyectos(docSnapshot.data().proyectos);
        }
      }
    };
  
    fetchProyectos();
  }, [usuarioId]);

  

  const handleAgregarProyecto = async () => {
    if(!proyecto) {
      message.error('El nombre del proyecto no puede estar vacio');
      return;
    } else if (proyecto.length < 3) {
      message.error('El nombre del proyecto debe contener al menos 3 caracteres');
      return;
    }
  
    if (usuarioId && proyecto) {
      const userRef = doc(firestore, 'users', usuarioId);
      const nuevasProyectos = [...proyectos, { nombre: proyecto, rol: 'admin' }];
      await updateDoc(userRef, { proyectos: nuevasProyectos });
      setProyectos(nuevasProyectos);
      setProyecto('');
    }
  };

  const handleEditarProyecto = async () => {
    if (usuarioId && proyecto && editando !== null) {
      const userRef = doc(firestore, 'users', usuarioId);
      let nuevosProyectos = [...proyectos];
      nuevosProyectos[editando] = { nombre: proyecto, rol: 'admin' };
      await updateDoc(userRef, { proyectos: nuevosProyectos });
      setProyectos(nuevosProyectos);
      setProyecto('');
      setEditando(null);
    }
  };

  const invitarUsuario = async () => {
    if (emailInvitado === auth.currentUser?.email) {
      message.error('No puedes autoinvitarte');
      return;
    }

    if (emailInvitado && proyectoSeleccionadoInvitacion) {
      const tokenInvitacion = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      await addDoc(collection(firestore, 'invitaciones'), {
        proyecto: proyectoSeleccionadoInvitacion.nombre,
        invitado: emailInvitado,
        estado: 'pendiente',
        token: tokenInvitacion,
        proyectoId: proyectoSeleccionadoInvitacion.id
      });

      await addDoc(collection(firestore, 'miembrosProyecto'), {
        uid: usuarioId,
        proyectoId: proyectoSeleccionadoInvitacion.id,
        rol: 'colaborador'
      });

      emailjs.send(serviceId, templateId, {
        to_email: emailInvitado,
        email_invitado: emailInvitado,
        nombre_proyecto: proyectoSeleccionadoInvitacion.nombre,
        enlace_invitacion: `http://localhost:3000/aceptar-invitacion/${tokenInvitacion}`
      }, userId)
      .then((result) => {
        message.success('Invitación enviada con éxito');
      }, (error) => {
        message.error('Ocurrió un error al enviar la invitación');
        console.log(error);
      });

      setEmailInvitado('');
      setProyectoSeleccionadoInvitacion(null);
      setIsModalVisible(false);
    } else {
      message.error('Por favor, introduce un correo electrónico y selecciona un proyecto');
    }
  };

  const handleEliminarProyecto = async (index) => {
    const nuevaListaProyectos = proyectos.filter((_, i) => i !== index);
    setProyectos(nuevaListaProyectos);

    const userRef = doc(firestore, 'users', usuarioId);
    await updateDoc(userRef, { proyectos: nuevaListaProyectos });
  };

  const handleSeleccionarProyecto = (proyectoSeleccionado) => {
    if (proyectoSeleccionado) {
      setProyectoSeleccionado(proyectoSeleccionado.nombre || proyectoSeleccionado);
      message.success(`Proyecto ${proyectoSeleccionado.nombre || proyectoSeleccionado} seleccionado con éxito`);
    } else {
      message.error('Proyecto no seleccionado');
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Proyectos</h2>
      <Input
        value={proyecto}
        onChange={(e) => setProyecto(e.target.value)}
        placeholder="Nombre del proyecto"
        style={{ marginBottom: '10px' }}
      />
      <Button onClick={editando !== null ? handleEditarProyecto : handleAgregarProyecto} style={{ marginBottom: '10px', marginRight: '10px' }}>
        {editando !== null ? 'Editar Proyecto' : 'Agregar Proyecto'}
      </Button>
      <Button onClick={() => setIsModalVisible(true)} style={{ marginBottom: '10px' }}>
        Invitar a Usuario
      </Button>
      <List
        bordered
        dataSource={proyectos}
        renderItem={(item, index) => (
          <List.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>{item.nombre} {item.rol ? `(${item.rol})` : ''}</span>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button onClick={() => { setEditando(index); setProyecto(item.nombre); }}>Editar</Button>
                <Button onClick={() => handleEliminarProyecto(index)}>Eliminar</Button>
                <Button onClick={() => handleSeleccionarProyecto(item)}>Seleccionar</Button>
              </div>
            </div>
          </List.Item>
        )}
      />
      <Modal
        title="Invitar a un usuario al proyecto"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={invitarUsuario}
      >
        <Input
          value={emailInvitado}
          onChange={(e) => setEmailInvitado(e.target.value)}
          placeholder="Correo electrónico del usuario"
          style={{ marginBottom: '10px' }}
        />
        <Select
          value={proyectoSeleccionadoInvitacion}
          onChange={setProyectoSeleccionadoInvitacion}
          placeholder="Selecciona un proyecto"
          style={{ width: '100%' }}
        >
          {proyectos.map((proyecto, index) => (
            <Option key={index} value={proyecto}>
              {proyecto.nombre}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}

export default Proyectos;