import React from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './../styles/HomePage.css'; // Crearemos este archivo para los estilos

const HomePage = () => {
  return (
    <Container fluid className="homepage-container text-center text-white">
      <Row className="align-items-center h-100">
        <Col>
          <h1 className="display-1">🦉 Owlboard</h1>
          <p className="lead">Tu pizarra colaborativa en tiempo real.</p>
          <p>Dibuja, anota y comparte tus ideas sin límites.</p>
          <div className="mt-4">
            <Link to="/login">
              <Button variant="light" size="lg" className="m-2">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline-light" size="lg" className="m-2">
                Registrarse
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;