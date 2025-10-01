import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getUserDashboards, DashboardOut } from '../services/userApi';

const MyBoardsPage = () => {
  const [dashboards, setDashboards] = useState<DashboardOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDashboards = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }

        const userDashboards = await getUserDashboards(parseInt(userId));
        setDashboards(userDashboards);
      } catch (err: any) {
        console.error('Failed to fetch dashboards:', err);
        setError('Error al cargar los tableros');
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401 || err.response?.status === 404) {
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDashboards();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <>
      <Nav className="bg-light p-2 mb-4 d-flex justify-content-between align-items-center">
        <Nav.Item>
          <Link to="/" className="navbar-brand">🦉 Owlboard</Link>
        </Nav.Item>
        <div>
          <Link to="/profile">
            <Button variant="outline-primary" className="me-2">Mi Perfil</Button>
          </Link>
          <Button variant="outline-danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
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

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando tableros...</span>
            </Spinner>
          </div>
        ) : (
          <Row>
            {dashboards.length > 0 ? (
              dashboards.map((dashboard) => (
                <Col md={4} key={dashboard.id} className="mb-4">
                  <Card>
                    <Card.Body>
                      <Card.Title>{dashboard.title}</Card.Title>
                      <Card.Text>
                        {dashboard.description || 'Sin descripción disponible'}
                      </Card.Text>
                      <Link to={`/board/${dashboard.id}`}>
                        <Button variant="primary">Abrir Tablero</Button>
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <Alert variant="info">
                  <h5>No tienes tableros aún</h5>
                  <p>¡Crea tu primer tablero para comenzar a colaborar!</p>
                  <Button variant="primary">+ Crear Primer Tablero</Button>
                </Alert>
              </Col>
            )}
          </Row>
        )}
      </Container>
    </>
  );
};

export default MyBoardsPage;

