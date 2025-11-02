import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, updateUser, UserOut } from '../services/userApi';
import TopBarLogin from '../components/TopBarLogin';
import TopBarNoLogin from '../components/TopBarNoLogin';

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 🔹 Datos del usuario logueado desde localStorage
  const loggedUserId = localStorage.getItem('user_id');
  const isLoggedIn = !!loggedUserId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = id || loggedUserId;
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

        if (err.response?.status === 401 || err.response?.status === 404) {
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_email');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, loggedUserId, navigate]);

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
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        {isLoggedIn ? <TopBarLogin /> : <TopBarNoLogin />}
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </Container>
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        {isLoggedIn ? <TopBarLogin /> : <TopBarNoLogin />}
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </>
    );
  }

  const canEdit = loggedUserId && user && user.id === parseInt(loggedUserId);

  return (
    <>
      {/* 🔹 Mostrar barra según estado */}
      {isLoggedIn ? <TopBarLogin /> : <TopBarNoLogin />}

      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: '#ffffffff' }}>Mi perfil</h2>
          {isLoggedIn && (
            <Button variant="outline-danger" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Card className="shadow-lg border-0" style={{ backgroundColor: '#f0f4f8' }}>
          <Card.Body>
            <div className="d-flex align-items-center mb-4">
              <img
                src="https://via.placeholder.com/100"
                alt="Profile"
                className="rounded-circle me-4 border border-3 border-primary"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ color: '#0d3b66' }}>{user?.full_name || 'Usuario'}</h4>
                <p className="text-muted mb-1">ID: {user?.id}</p>
                <p className="text-muted mb-1">Email: {user?.email}</p>
                <p className="text-muted">
                  Estado:{' '}
                  <span className={user?.is_active ? 'text-success' : 'text-danger'}>
                    {user?.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
            </div>

            {/* 🔹 Solo el dueño puede editar su perfil */}
            {canEdit ? (
              editing ? (
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
                    <Button type="submit" disabled={updating} variant="primary">
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
                <Button variant="primary" onClick={() => setEditing(true)}>
                  Editar Perfil
                </Button>
              )
            ) : (
              <Alert variant="info" className="mt-3">
                Solo puedes editar tu propio perfil.
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default UserProfilePage;
