"use client";

import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Link from 'next/link';
import "../styles/TopBar.css";

const TopBarNoLogin: React.FC = () => {
  return (
    <Navbar
      expand="lg"
      style={{
        backgroundColor: '#2f3b52',
        padding: '0.75rem 1.5rem',
      }}
      variant="dark"
      fixed="top"
    >
      <Container fluid>
        <Navbar.Brand
          as={Link}
          href="/"
          style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.5rem' }}
        >
          🦉 Owlboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link as={Link} href="/" style={{ color: '#ffffff' }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} href="/login" style={{ color: '#ffffff' }}>
              Login
            </Nav.Link>
            <Nav.Link as={Link} href="/register" style={{ color: '#ffffff' }}>
              Register
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopBarNoLogin;
