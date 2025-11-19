import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const Features: React.FC = () => {
  return (
    <section id="features" className="py-5">
      <Container>
        <h2 className="text-center fw-bold mb-4">¿Qué puedes hacer aquí?</h2>

        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Reportar alertas</Card.Title>
                <Card.Text>
                  Envía incidentes como daños viales, deslizamientos, fallas eléctricas y más.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Ver alertas cercanas</Card.Title>
                <Card.Text>
                  Explora en el mapa los problemas de tu barrio en tiempo real.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Conectar con autoridades</Card.Title>
                <Card.Text>
                  Tu reporte llega a quienes realmente pueden solucionarlo.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Features;
