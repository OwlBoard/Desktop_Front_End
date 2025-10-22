'use client';

// Client Component for Profile Page (receives SSR data as props)
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, Alert, Form } from 'react-bootstrap';
import TopBarLogin from '@/components/TopBarLogin';
import '@/styles/UserProfilePage.css';

interface UserOut {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

interface ProfileClientProps {
  user: UserOut;
  isOwnProfile: boolean;
  loggedUserId: string;
}

export default function ProfileClient({ user, isOwnProfile, loggedUserId }: ProfileClientProps) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user.full_name || '');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      // Update via Next.js API route (which proxies to FastAPI)
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      setEditing(false);
      
      // Refresh the page to get updated data from server
      router.refresh();
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError('Error updating profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <TopBarLogin />
      
      <div className="user-profile-page">
        <Container className="py-5">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Card className="profile-card shadow-lg">
            <Card.Body>
              <div className="profile-header">
                <div className="profile-avatar">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h2 className="profile-name">
                    {user.full_name || 'Anonymous User'}
                  </h2>
                  <p className="profile-email">{user.email}</p>
                  <div className="profile-badges">
                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-secondary'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="badge badge-info">
                      Member since {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="profile-actions mt-4">
                  {!editing ? (
                    <Button variant="primary" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <Form onSubmit={handleUpdate}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button type="submit" variant="primary" disabled={updating}>
                          {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditing(false);
                            setFullName(user.full_name || '');
                            setError('');
                            setSuccess('');
                          }}
                          disabled={updating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}
                </div>
              )}

              <div className="profile-details mt-4">
                <h5>Profile Details</h5>
                <dl className="row">
                  <dt className="col-sm-3">User ID:</dt>
                  <dd className="col-sm-9">{user.id}</dd>

                  <dt className="col-sm-3">Email:</dt>
                  <dd className="col-sm-9">{user.email}</dd>

                  <dt className="col-sm-3">Full Name:</dt>
                  <dd className="col-sm-9">{user.full_name || 'Not set'}</dd>

                  <dt className="col-sm-3">Account Status:</dt>
                  <dd className="col-sm-9">
                    {user.is_active ? (
                      <span className="text-success">✓ Active</span>
                    ) : (
                      <span className="text-danger">✗ Inactive</span>
                    )}
                  </dd>

                  <dt className="col-sm-3">Joined:</dt>
                  <dd className="col-sm-9">
                    {new Date(user.created_at).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
}
