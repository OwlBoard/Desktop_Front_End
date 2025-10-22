// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { loginUser } from "../services/userApi";
import TopBarNoLogin from "../components/TopBarNoLogin";
import "../styles/LoginPage.css";
import FooterBar from "../components/FooterBar";
import { useRedirectIfLogged } from "../hooks/useRedirectIfLogged";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useRedirectIfLogged();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser({ email, password });
      console.log("Login response:", response);

      const token =
        response.token || response.access_token || response.jwt || null;
      const userId =
        response.user_id || response.id || response.user?.id || null;

      // ✅ Extract name from message
      let userName =
        response.name ||
        response.username ||
        response.user?.name ||
        null;

      if (!userName && response.message) {
        const match = response.message.match(/Bienvenido\s+(.+)/i);
        if (match && match[1]) {
          userName = match[1].trim();
        }
      }

      if (token) localStorage.setItem("token", token);
      if (userId) localStorage.setItem("user_id", userId);
      if (userName) localStorage.setItem("user_name", userName);

      alert("✅ Login successful!");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <>
      <TopBarNoLogin />
      <div className="login-container">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">Accede a tu cuenta para continuar</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Entrar</button>

            {error && <p className="error-text">{error}</p>}
          </form>

          <div className="login-footer">
            <p>
              ¿No tienes cuenta?{" "}
              <a href="/register" className="register-link">
                Regístrate aquí
              </a>
            </p>
          </div>
          <FooterBar />
        </div>
        
      </div>
    </>
  );
};

export default LoginPage;
