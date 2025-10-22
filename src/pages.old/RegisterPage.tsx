import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/userApi';
import TopBarNoLogin from '../components/TopBarNoLogin';
import '../styles/RegisterPage.css';
import FooterBar from '../components/FooterBar';
import { useRedirectIfLogged } from "../hooks/useRedirectIfLogged";

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  useRedirectIfLogged();
  
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
    <div className="register-background">
      <TopBarNoLogin />
      <div className="register-container">
        <div className="register-card">
          <h2>Crear Cuenta en Owlboard</h2>
          <p className="register-subtitle">Únete a la comunidad y comienza a explorar tableros interactivos</p>

          {error && <p className="error-text">{error}</p>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group id="fullName" className="mb-3">
              <Form.Control
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                disabled={loading}
              />
            </Form.Group>
            <Form.Group id="email" className="mb-3">
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                required
                disabled={loading}
              />
            </Form.Group>
            <Form.Group id="password" className="mb-3">
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña (mínimo 6 caracteres)"
                required
                minLength={6}
                disabled={loading}
              />
            </Form.Group>
            <Button className="w-100 mt-3" type="submit" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
          </Form>

          <div className="register-footer">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="login-link">
              Inicia sesión
            </Link>
          </div>
        </div>
        <FooterBar />
      </div>
    </div>
  );
};

export default RegisterPage;
