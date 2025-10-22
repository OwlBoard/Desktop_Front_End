"use client";

import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Link from "next/link";
import TopBarNoLogin from "@/components/TopBarNoLogin";
import TopBarLogin from "@/components/TopBarLogin";
import "@/styles/HomePage.css";
import horseImg from "@/styles/images/horse.png";
import catImg from "@/styles/images/cat.gif";
import landscapeImg from "@/styles/images/landscape.gif";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Invitado");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize state from localStorage after component mounts (client-side only)
    const storedUserId = localStorage.getItem("user_id");
    const storedUserName = localStorage.getItem("user_name");
    setIsLoggedIn(!!storedUserId);
    setUserName(storedUserName || "Invitado");
    setUserId(storedUserId);

    const handleStorageChange = () => {
      const userId = localStorage.getItem("user_id");
      const userNameStored = localStorage.getItem("user_name");
      setIsLoggedIn(!!userId);
      setUserName(userNameStored || "Invitado");
      setUserId(userId);
    };

    window.addEventListener("storage", handleStorageChange);

    // Optional: re-check every few seconds (for SPA internal updates)
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Fixed top bar */}
      <div className="fixed-top">
        {isLoggedIn ? (
          <TopBarLogin userName={userName} />
        ) : (
          <TopBarNoLogin />
        )}
      </div>

      {/* Hero Section */}
      <section className="hero-section d-flex align-items-center justify-content-center text-center text-white">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1 className="display-2 fw-bold">Owlboard</h1>
          <p className="lead">Dibuja, anota y comparte tus ideas en tiempo real.</p>
          <p>Tu pizarra colaborativa para equipos creativos y educativos.</p>
          <div className="mt-4">
            {isLoggedIn ? (
              <Link href={`/user/${userId}/dashboards`}>
                <Button variant="light" size="lg" className="m-2">
                  Create a board
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="light" size="lg" className="m-2">
                  Create a board
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section text-center py-5 text-light">
        <Container>
          <h2 className="mb-5">¿Qué puedes hacer con Owlboard?</h2>
          <Row>
            <Col md={4} className="mb-4">
              <img
                src={landscapeImg.src}
                alt="Dibuja en tiempo real"
                className="feature-img"
                style={{
                  width: "300px",
                  height: "300px",
                  objectFit: "contain",
                }}
              />
              <h4>Dibuja en tiempo real</h4>
              <p>Colabora con tus compañeros mientras todos editan el mismo lienzo.</p>
            </Col>
            <Col md={4} className="mb-4">
              <img
                src={horseImg.src}
                alt="Comparte fácilmente"
                className="feature-img"
                style={{
                  width: "300px",
                  height: "300px",
                  objectFit: "contain",
                }}
              />
              <h4>Comparte fácilmente</h4>
              <p>Envía enlaces o invita usuarios a tu sesión sin complicaciones.</p>
            </Col>
            <Col md={4} className="mb-4">
              <img
                src={catImg.src}
                alt="Expresa tus ideas"
                className="feature-img"
                style={{
                  width: "300px",
                  height: "300px",
                  objectFit: "contain",
                }}
              />
              <h4>Expresa tus ideas</h4>
              <p>Usa el botón de comentarios para expresar tu opinión.</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quote Section */}
      <section className="quote-section text-center py-5">
        <blockquote>
          <h3 className="fst-italic text-white">
            "Las mejores ideas nacen cuando todos trabajan juntos."
          </h3>
          <p className="text-light mt-3">— Equipo Owlboard</p>
        </blockquote>
      </section>

      {/* Footer */}
      <footer className="footer text-center py-3">
        <p>© {new Date().getFullYear()} Owlboard — Crea, Colabora y Comparte</p>
      </footer>
    </>
  );
}
