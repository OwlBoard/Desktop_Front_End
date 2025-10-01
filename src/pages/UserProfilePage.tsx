import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser, UserOut } from '../services/userApi';

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }

        const userData = await getUser(parseInt(userId));
        setUser(userData);
        setFullName(userData.full_name || '');
      } catch (err: any) {
        console.error('Failed to fetch user profile:', err);
        setError('Error al cargar el perfil de usuario');
        
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

    fetchUserProfile();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    try {
      const updatedUser = await updateUser(user.id, { full_name: fullName });
      setUser(updatedUser);
      setEditing(false);
      setError('');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError('Error al actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error && !user) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Mi Perfil</h2>
        <Button variant="outline-danger" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <div className="d-flex align-items-center mb-4">
            <img 
              src="https://via.placeholder.com/100" 
              alt="Profile" 
              className="rounded-circle me-4"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <div>
              <h4>{user?.full_name || 'Usuario'}</h4>
              <p className="text-muted mb-1">ID: {user?.id}</p>
              <p className="text-muted mb-1">Email: {user?.email}</p>
              <p className="text-muted">
                Estado: <span className={user?.is_active ? 'text-success' : 'text-danger'}>
                  {user?.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </p>
            </div>
          </div>

          {editing ? (
            <Form onSubmit={handleUpdateProfile}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button type="submit" disabled={updating}>
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setEditing(false);
                    setFullName(user?.full_name || '');
                  }}
                  disabled={updating}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          ) : (
            <Button onClick={() => setEditing(true)}>
              Editar Perfil
            </Button>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserProfilePage;
