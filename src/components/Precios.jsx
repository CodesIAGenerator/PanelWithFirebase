// Precios.jsx
import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';

const { Title } = Typography;

function Precios() {
  const planes = [
    {
      nombre: "Básico",
      mensual: "$10/mes",
      anual: "$100/año",
      caracteristicas: [
        "3 Proyectos",
        "Soporte básico",
        "Acceso a la comunidad"
      ]
    },
    {
      nombre: "Premium",
      mensual: "$20/mes",
      anual: "$200/año",
      caracteristicas: [
        "Proyectos ilimitados",
        "Soporte prioritario",
        "Acceso a cursos exclusivos",
        "Integraciones adicionales"
      ]
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Planes y Precios</Title>
      <Row gutter={16}>
        {planes.map(plan => (
          <Col span={12} key={plan.nombre}>
            <Card title={plan.nombre} bordered={true} style={{ marginBottom: '20px' }}>
              <p><strong>Mensual:</strong> {plan.mensual}</p>
              <p><strong>Anual:</strong> {plan.anual}</p>
              <ul>
                {plan.caracteristicas.map(caracteristica => (
                  <li key={caracteristica}>{caracteristica}</li>
                ))}
              </ul>
              <Button type="primary">Suscribirse</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default Precios;
