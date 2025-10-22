'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { getUser, updateUser, UserOut } from '@/services/userApi';
import TopBarLogin from '@/components/TopBarLogin';
import TopBarNoLogin from '@/components/TopBarNoLogin';
import '@/styles/UserProfilePage.css';

// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';

export default function UserProfilePage() {
  const [user, setUser] = useState<UserOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const loggedUserId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
  const isLoggedIn = !!loggedUserId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = id || loggedUserId;
        if (!userId) {
          router.push('/login');
          return;
        }

        const userData = await getUser(parseInt(userId));
        setUser(userData);
        setFullName(userData.full_name || '');
      } catch (err: any) {
        console.error('Failed to fetch user profile:', err);
        setError('Error al cargar el perfil de usuario');

        if (err.response?.status === 401 || err.response?.status === 404) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_email');
          }
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, loggedUserId, router]);

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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
    }
    router.push('/login');
  };

  if (loading) {
    return (
      <>
        {isLoggedIn ? <TopBarLogin /> : <TopBarNoLogin />}
        <div className="profile-loading">
          <Spinner animation="border" variant="primary" />
          <span>Cargando perfil...</span>
        </div>
      </>
    );
  }

  if (error && !user) {
    return (
      <>
        {isLoggedIn ? <TopBarLogin /> : <TopBarNoLogin />}
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
          <Button variant="primary" onClick={() => router.push('/')}>
            Volver al Inicio
          </Button>
        </Container>
      </>
    );
  }

  const canEdit = loggedUserId && user && user.id === parseInt(loggedUserId);

  return (
    <>
      {isLoggedIn ? <TopBarLogin /> : <TopBarNoLogin />}

      <div className="user-profile-page">
        <Container className="profile-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: '#ffffff' }}>
              {canEdit ? 'Mi perfil' : `Perfil de ${user?.full_name || user?.email}`}
            </h2>
            {isLoggedIn && canEdit && (
              <Button variant="outline-danger" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            )}
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Card className="profile-card shadow-lg border-0">
            <Card.Body>
              <div className="profile-header mb-4">
                <img
                  src="https://via.placeholder.com/120"
                  alt="Profile"
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <h4 style={{ color: '#38bdf8' }}>{user?.full_name || 'Usuario'}</h4>
                  <p className="text-light mb-1">ID: {user?.id}</p>
                  <p className="text-light mb-1">Email: {user?.email}</p>
                  <p className="text-light">
                    Estado:{' '}
                    <span className={user?.is_active ? 'text-success' : 'text-danger'}>
                      {user?.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Only owner can edit their profile */}
              {canEdit ? (
                editing ? (
                  <Form onSubmit={handleUpdateProfile}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-light">Nombre Completo</Form.Label>
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

              <div className="mt-4">
                <Button
                  variant="outline-light"
                  onClick={() => router.push(`/user/${user?.id}/dashboards`)}
                >
                  Ver Tableros de {user?.full_name || 'este usuario'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
}
