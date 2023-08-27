import { useSpring, animated } from 'react-spring';
import { List, Checkbox, Button, Popconfirm } from 'antd';

function TareaItem({ item, index, handleMarcarCompletada, handleEditarTarea, handleBorrarTarea }) {
  const props = useSpring({
    from: { backgroundColor: '#ff7f7f' }, // rojo suave
    to: { backgroundColor: item.completada ? '#7fff7f' : '#ff7f7f' }, // verde suave
    config: { duration: 1000 }
  });

  return (
    <animated.div style={props}>
      <List.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox checked={item.completada} onChange={() => handleMarcarCompletada(index)} />
            <div style={{ marginLeft: '10px' }}>{item.nombre}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button onClick={() => handleEditarTarea(index)}>Editar</Button>
            <Popconfirm title="¿Estás seguro de que quieres eliminar esta tarea?" onConfirm={() => handleBorrarTarea(index)}>
              <Button>Eliminar</Button>
            </Popconfirm>
          </div>
        </div>
      </List.Item>
    </animated.div>
  );
}

export default TareaItem;