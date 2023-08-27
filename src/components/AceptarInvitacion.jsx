import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDocs, getDoc, query, collection, where, updateDoc, doc, addDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { auth } from '../firebase/firebase';
import { message, Spin, Result } from 'antd';

const AceptarInvitacion = () => {
  const { token } = useParams();
  const usuarioId = auth.currentUser?.uid;
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const aceptarInvitacion = async () => {
      const q = query(collection(firestore, 'invitaciones'), where('token', '==', token));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const invitacionData = querySnapshot.docs[0].data();
        const invitacionId = querySnapshot.docs[0].id;

        // Cambiar el estado de la invitación a "aceptado"
        const invitacionRef = doc(firestore, 'invitaciones', invitacionId);
        await updateDoc(invitacionRef, { estado: 'aceptado' });

        if (usuarioId) {
          const userRef = doc(firestore, 'users', usuarioId);
          const userDoc = await getDoc(userRef);
          const proyectos = userDoc.data().proyectos || [];
          proyectos.push({
            nombre: invitacionData.proyecto,
            rol: 'colaborador'
          });
          await updateDoc(userRef, { proyectos });
        
          // Aquí es donde añades el usuario al proyecto en la nueva colección
          await addDoc(collection(firestore, 'miembrosProyecto'), {
            uid: usuarioId,
            proyectoId: invitacionData.proyectoId, // Asegúrate de que la invitación contiene el id del proyecto
            rol: 'colaborador'
          });
        }

        message.success('Invitación aceptada con éxito');
        setAccepted(true);
      } else {
        message.error('Invitación no válida o ya aceptada');
      }
      setLoading(false);
    };

    aceptarInvitacion();
  }, [token, usuarioId]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {loading ? (
        <Spin size="large" />
      ) : accepted ? (
        <Result
          status="success"
          title="¡Invitación aceptada con éxito!"
          subTitle="Ahora eres parte del proyecto."
        />
      ) : (
        <Result
          status="error"
          title="Invitación no válida o ya aceptada"
          subTitle="Por favor, verifica el enlace de la invitación."
        />
      )}
    </div>
  );
};

export default AceptarInvitacion;