import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Lógica para llamar al API Client que se conecta con el User_Service
    console.log('Iniciando sesión con:', { email, password });
    // Si el login es exitoso, redirigir a /boards
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row>
        <Col>
          <Card style={{ width: '25rem' }}>
            <Card.Body>
              <h2 className="text-center mb-4">🦉 Iniciar Sesión en Owlboard</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Form.Group>
                <Form.Group id="password"  className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </Form.Group>
                <Button className="w-100 mt-3" type="submit">Iniciar Sesión</Button>
              </Form>
              <div className="w-100 text-center mt-3">
                ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;