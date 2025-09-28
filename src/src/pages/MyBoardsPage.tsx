import React from 'react';
import { Container, Row, Col, Card, Button, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Datos de ejemplo. Eventualmente vendrán del Canvas_Service.
const mockBoards = [
  { id: '1a', name: 'Brainstorming Proyecto X', lastModified: 'Hace 2 horas' },
  { id: '2b', name: 'Diseño UI/UX App Móvil', lastModified: 'Ayer' },
  { id: '3c', name: 'Plan de Marketing Q4', lastModified: 'Hace 3 días' },
];

const MyBoardsPage = () => {
  return (
    <>
      <Nav className="bg-light p-2 mb-4 d-flex justify-content-between">
        <Nav.Item>
            <Link to="/" className="navbar-brand">🦉 Owlboard</Link>
        </Nav.Item>
        <Nav.Item>
            <Button variant="outline-danger">Cerrar Sesión</Button>
        </Nav.Item>
      </Nav>

      <Container>
        <Row className="mb-4 align-items-center">
          <Col>
            <h2>Mis Tableros</h2>
          </Col>
          <Col className="text-end">
            <Button>+ Crear Nuevo Tablero</Button>
          </Col>
        </Row>
        <Row>
          {mockBoards.map((board) => (
            <Col md={4} key={board.id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{board.name}</Card.Title>
                  <Card.Text>Última modificación: {board.lastModified}</Card.Text>
                  <Link to={`/board/${board.id}`}>
                    <Button variant="primary">Abrir Tablero</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default MyBoardsPage;