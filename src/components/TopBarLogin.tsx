// src/components/TopBarLogin.tsx
import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../styles/TopBarLogin.css";

const TopBarLogin: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    if (storedName) setUserName(storedName);
  }, []);

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
          to="/"
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
            <Nav.Link as={Link} to="/" style={{ color: "#ffffff" }}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboards" style={{ color: "#ffffff" }}>
              Dashboards
            </Nav.Link>
            <Nav.Link as={Link} to="/join" style={{ color: "#ffffff" }}>
              Join a Board
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
              <NavDropdown.Item as={Link} to={`/profile/${localStorage.getItem("user_id")}`}>
                View Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to={`/edit-profile/${localStorage.getItem("user_id")}`}>
                Edit Profile
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
