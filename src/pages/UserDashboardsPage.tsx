import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import TopBarLogin from "../components/TopBarLogin";
import TopBarNoLogin from "../components/TopBarNoLogin";
import FooterBar from "../components/FooterBar";
import "../styles/UserDashboardsPage.css";

const DashboardsPage = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("user_name");
  const userId = localStorage.getItem("user_id");
  const isLoggedIn = !!userId;

  useEffect(() => {
    const fetchDashboards = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}/dashboards`);
        if (!response.ok) throw new Error("Error al cargar los dashboards");
        const data = await response.json();

        if (data.length === 0) {
          const placeholders = Array.from({ length: 4 }).map((_, index) => ({
            id: index + 1,
            title: `Tablero de ejemplo ${index + 1}`,
            description:
              "Este es un tablero de ejemplo. Aquí podrás visualizar tus estadísticas y datos personalizados.",
          }));
          setDashboards(placeholders);
        } else {
          setDashboards(data);
        }
      } catch (error) {
        console.error("Error:", error);
        const placeholders = Array.from({ length: 4 }).map((_, index) => ({
          id: index + 1,
          title: `Tablero de ejemplo ${index + 1}`,
          description:
            "Este es un tablero de ejemplo. Aquí podrás visualizar tus estadísticas y datos personalizados.",
        }));
        setDashboards(placeholders);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, [userId, isLoggedIn]);

  return (
    <>
      {isLoggedIn ? <TopBarLogin /> : <TopBarNoLogin />}

      <div className="dashboards-page">
        {/* Encabezado azul */}
        <div className="dashboards-header">
          <Container>
            <h2 className="page-title text-center">
              {isLoggedIn ? (
                <>
                  Tableros del usuario{" "}
                  <span className="username">{userName}</span>
                </>
              ) : (
                "Tableros públicos"
              )}
            </h2>
          </Container>
        </div>

        <Container className="dashboards-container">
          {loading ? (
            <div className="text-center mt-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Row className="g-4 justify-content-center">
              {dashboards.map((dashboard, index) => (
                <Col xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card className="dashboard-card">
                    <Card.Body>
                      <div className="placeholder-icon">📊</div>
                      <Card.Title>{dashboard.title}</Card.Title>
                      <Card.Text>{dashboard.description}</Card.Text>
                      <Button variant="primary" size="sm">
                        Ver detalles
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {isLoggedIn && (
            <div className="text-center mt-5">
              <Button
                variant="outline-primary"
                href={`/profile/${userId}`}
                className="go-profile-btn"
              >
                Ir al perfil del usuario
              </Button>
            </div>
          )}
        </Container>
      </div>

      <FooterBar />
    </>
  );
};

export default DashboardsPage;
