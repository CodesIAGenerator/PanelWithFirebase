import React, { useState, useEffect } from 'react';
import { Button, Input, List, Checkbox, DatePicker, Popconfirm, Badge } from 'antd';
import { auth, firestore } from '../firebase/firebase';
import { doc, updateDoc, getDoc, collection, getDocs, Timestamp, setDoc } from 'firebase/firestore';
import TareaItem from './TareaItem';
import { useSpring, animated } from 'react-spring';
import './../Tareas.css';

function Tareas({ proyectoSeleccionado }) {
  const [tarea, setTarea] = useState('');
  const [fechaLimite, setFechaLimite] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [editandoTareaIndex, setEditandoTareaIndex] = useState(null);

  const usuarioId = auth.currentUser?.uid;

 

  // Obtener todos los documentos de firestore
  const logFirestoreData = async () => {
    const collections = ['proyectos', 'users', 'invitaciones', 'miembrosProyecto']; // Añade aquí todas tus colecciones
  
    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      querySnapshot.forEach((doc) => {
        console.log(`${collectionName} - ${doc.id} =>`, doc.data());
      });
    }
  };
  
  //logFirestoreData();

  const exportFirestoreData = async () => {
    const collections = ['proyectos', 'users', 'invitaciones', 'miembrosProyecto']; // Añade aquí todas tus colecciones
    let data = {};
  
    for (const collectionName of collections) {
      data[collectionName] = {};
      const querySnapshot = await getDocs(collection(firestore, collectionName));
      querySnapshot.forEach((doc) => {
        data[collectionName][doc.id] = doc.data();
      });
    }
  
    const dataStr = JSON.stringify(data);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
    let exportFileDefaultName = 'data.json';
  
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  //exportFirestoreData();

  useEffect(() => {
    const fetchTareas = async () => {
      if (proyectoSeleccionado) {
        const proyectoRef = doc(firestore, 'proyectos', proyectoSeleccionado);
        const proyectoDoc = await getDoc(proyectoRef);
        if (proyectoDoc.exists()) {
          setTareas(proyectoDoc.data().tareas || []);
        }
      }
    };
  
    fetchTareas();
  }, [proyectoSeleccionado]);

  const handleAgregarOEditarTarea = async () => {
    if (usuarioId && proyectoSeleccionado) {
      const proyectoRef = doc(firestore, 'proyectos', proyectoSeleccionado);
      let nuevasTareas;
      if (editando !== null) {
        nuevasTareas = [...tareas];
        nuevasTareas[editando] = { 
          nombre: tarea, 
          fechaLimite: Timestamp.fromDate(fechaLimite.toDate()), // Convertir a Date primero
          completada: false 
        };
      } else {
        nuevasTareas = [...tareas, { 
          nombre: tarea, 
          fechaLimite: Timestamp.fromDate(fechaLimite.toDate()), // Convertir a Date primero
          completada: false 
        }];
      }
      const proyectoDoc = await getDoc(proyectoRef);
      if (proyectoDoc.exists()) {
        await updateDoc(proyectoRef, { tareas: nuevasTareas });
      } else {
        await setDoc(proyectoRef, { tareas: nuevasTareas });
      }
      setTareas(nuevasTareas);
      setTarea('');
      setFechaLimite(null);
      setEditando(null);
    }
  };

  const handleBorrarTarea = async (index) => {
    const nuevasTareas = [...tareas];
    nuevasTareas.splice(index, 1);

    if (usuarioId && proyectoSeleccionado) {
      const proyectoRef = doc(firestore, 'proyectos', proyectoSeleccionado);
      await updateDoc(proyectoRef, { tareas: nuevasTareas });
      setTareas(nuevasTareas);
    }
  };

  const handleEditarTarea = (index) => {
    setTarea(tareas[index].nombre);
    setFechaLimite(tareas[index].fechaLimite);
    setEditando(index);
    setEditandoTareaIndex(index);
  };

  const handleMarcarCompletada = (index) => {
    const nuevasTareas = [...tareas];
    nuevasTareas[index].completada = !nuevasTareas[index].completada;
    setTareas(nuevasTareas);
  };

  return (
    <div style={{ margin: '20px' }}>
      {proyectoSeleccionado && <h2>Proyecto seleccionado: {proyectoSeleccionado}</h2>}
      {proyectoSeleccionado ? (
        <>
          <Input
            placeholder="Nombre de la tarea"
            value={tarea}
            onChange={(e) => setTarea(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <DatePicker
            placeholder="Fecha límite"
            value={fechaLimite}
            onChange={setFechaLimite}
            style={{ marginBottom: '10px' }}
          />
          <Button onClick={handleAgregarOEditarTarea} style={{ marginBottom: '10px' }}>
            {editando !== null ? 'Editar Tarea' : 'Agregar Tarea'}
          </Button>
          <List
            bordered
            dataSource={tareas}
            renderItem={(item, index) => (
              <TareaItem
                item={item}
                index={index}
                handleMarcarCompletada={handleMarcarCompletada}
                handleEditarTarea={handleEditarTarea}
                handleBorrarTarea={handleBorrarTarea}
              />
            )}
          />
        </>
      ) : (
        <h2>Por favor, selecciona un proyecto para ver las tareas</h2>
      )}
    </div>
  );
  }
            
export default Tareas;