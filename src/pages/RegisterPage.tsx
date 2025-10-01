import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/userApi';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await registerUser({
        email,
        password,
        full_name: fullName
      });
      
      console.log('Registration successful:', response.message);
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(
        err.response?.data?.detail || 
        'Error al crear la cuenta. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row>
        <Col>
          <Card style={{ width: '25rem' }}>
            <Card.Body>
              <h2 className="text-center mb-4">🦉 Crear Cuenta en Owlboard</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group id="fullName" className="mb-3">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="Tu nombre completo"
                    disabled={loading}
                  />
                </Form.Group>
                <Form.Group id="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </Form.Group>
                <Form.Group id="password" className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6}
                    disabled={loading}
                  />
                  <Form.Text className="text-muted">
                    Mínimo 6 caracteres
                  </Form.Text>
                </Form.Group>
                <Button 
                  className="w-100 mt-3" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Creando cuenta...' : 'Registrarse'}
                </Button>
              </Form>
              <div className="w-100 text-center mt-3">
                ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;