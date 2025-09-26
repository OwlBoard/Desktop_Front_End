import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Importa las páginas que vamos a crear
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBoardsPage from './pages/MyBoardsPage';
import PaintPage from './pages/PaintPage'; // La página de la pizarra que ya tienes

function App() {
  return (
    <Router>
      <div className="App">
        {/* Aquí podrías poner un componente Navbar que se muestre en todas las páginas */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/boards" element={<MyBoardsPage />} />
          <Route path="/board/:boardId" element={<PaintPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;