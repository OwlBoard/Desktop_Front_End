"use client";

// src/components/TopBarLogin.tsx
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import "../styles/TopBarLogin.css";

interface TopBarLoginProps {
  userName?: string;
}

const TopBarLogin: React.FC<TopBarLoginProps> = ({ userName = "User" }) => {
  const [expanded, setExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserId(localStorage.getItem("user_id"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <Navbar
      expand="lg"
      variant="dark"
      expanded={expanded}
      style={{
        backgroundColor: "#2f3b52",
        padding: "0.75rem 1.5rem",
      }}
    >
      <Container fluid>
        <Navbar.Brand
          as={Link}
          href="/"
          style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.5rem" }}
        >
          🦉 Owlboard
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="navbar-nav"
          onClick={() => setExpanded((prev) => !prev)}
        />

        <Navbar.Collapse id="navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link as={Link} href="/" style={{ color: "#ffffff" }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} href="/my-boards" style={{ color: "#ffffff" }}>
              My Boards
            </Nav.Link>
            <Nav.Link as={Link} href="/board" style={{ color: "#ffffff" }}>
              New Board
            </Nav.Link>
            <Nav.Link as={Link} href="/paint" style={{ color: "#ffffff" }}>
              Paint
            </Nav.Link>

            <NavDropdown
              title={
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#ffffff",
                    gap: "6px",
                  }}
                >
                  <FaUserCircle size={22} /> {userName || "User"}
                </span>
              }
              id="user-dropdown"
              align="end"
              menuVariant="dark"
              show={dropdownOpen}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
              className="no-caret"
            >
              <NavDropdown.Item as={Link} href={`/profile/${userId}`}>
                View Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} href={`/user/${userId}/dashboards`}>
                My Dashboards
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopBarLogin;
